package com.egrocery.store.service;

import com.egrocery.store.dto.request.UpdatePaymentStatusRequest;
import com.egrocery.store.dto.request.VerifyPaymentRequest;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.PaymentInitiateResponse;
import com.egrocery.store.dto.response.PaymentResponse;
import com.egrocery.store.entity.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {

    PaymentInitiateResponse initiatePayment(Long userId, Long orderId);

    PaymentResponse verifyPayment(Long userId, Long orderId, VerifyPaymentRequest request);

    List<PaymentResponse> getPaymentsForMyOrder(Long userId, Long orderId);

    PageResponse<PaymentResponse> getAllForAdmin(PaymentStatus status, int page, int size);

    List<PaymentResponse> getPaymentsForOrderAdmin(Long orderId);

    PaymentResponse updateStatusByAdmin(Long paymentId, UpdatePaymentStatusRequest request);
}