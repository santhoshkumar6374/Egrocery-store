package com.egrocery.store.service.impl;

import com.egrocery.store.config.RazorpayProperties;
import com.egrocery.store.dto.request.UpdatePaymentStatusRequest;
import com.egrocery.store.dto.request.VerifyPaymentRequest;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.PaymentInitiateResponse;
import com.egrocery.store.dto.response.PaymentResponse;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.Payment;
import com.egrocery.store.entity.enums.PaymentMethod;
import com.egrocery.store.entity.enums.PaymentStatus;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.OrderRepository;
import com.egrocery.store.repository.PaymentRepository;
import com.egrocery.store.service.PaymentService;
import com.egrocery.store.service.RazorpayGatewayService;
import com.egrocery.store.util.PaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayGatewayService razorpayGatewayService;
    private final RazorpayProperties razorpayProperties;

    @Override
    @Transactional
    public PaymentInitiateResponse initiatePayment(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("This order has already been paid for");
        }

        PaymentMethod method = order.getPaymentMethod();

        if (method == PaymentMethod.CASH_ON_DELIVERY) {
            Payment payment = paymentRepository.save(Payment.builder()
                    .order(order)
                    .method(method)
                    .amount(order.getTotalAmount())
                    .status(PaymentStatus.PENDING)
                    .build());

            return PaymentInitiateResponse.builder()
                    .paymentId(payment.getId())
                    .method(method)
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .codConfirmed(true)
                    .build();
        }

        // Every non-COD method (UPI, cards, net banking, or RAZORPAY directly) goes through
        // the Razorpay Checkout widget, which itself offers all of those as options.
        String gatewayOrderId = razorpayGatewayService.createOrder(order.getTotalAmount(), order.getOrderNumber());

        Payment payment = paymentRepository.save(Payment.builder()
                .order(order)
                .method(method)
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .gatewayOrderId(gatewayOrderId)
                .build());

        return PaymentInitiateResponse.builder()
                .paymentId(payment.getId())
                .method(method)
                .amount(order.getTotalAmount())
                .currency("INR")
                .codConfirmed(false)
                .razorpayOrderId(gatewayOrderId)
                .razorpayKeyId(razorpayProperties.getKeyId())
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse verifyPayment(Long userId, Long orderId, VerifyPaymentRequest request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByGatewayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("No matching payment attempt found"));

        if (!payment.getOrder().getId().equals(order.getId())) {
            throw new BadRequestException("This payment does not belong to the specified order");
        }

        boolean valid = razorpayGatewayService.verifySignature(
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (valid) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(request.getRazorpayPaymentId());
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);

        if (!valid) {
            throw new BadRequestException("Payment verification failed. Please try again.");
        }

        return PaymentMapper.toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsForMyOrder(Long userId, Long orderId) {
        orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<PaymentResponse> getAllForAdmin(PaymentStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = status != null ? paymentRepository.findByStatus(status, pageable) : paymentRepository.findAll(pageable);
        return PageResponse.from(result.map(PaymentMapper::toResponse));
    }

    @Override
    public List<PaymentResponse> getPaymentsForOrderAdmin(Long orderId) {
        return paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponse updateStatusByAdmin(Long paymentId, UpdatePaymentStatusRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(request.getStatus());
        if (request.getStatus() == PaymentStatus.FAILED && request.getNote() != null) {
            payment.setFailureReason(request.getNote());
        }
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus(request.getStatus());
        orderRepository.save(order);

        return PaymentMapper.toResponse(payment);
    }
}