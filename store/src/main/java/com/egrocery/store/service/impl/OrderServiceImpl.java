package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.CreateOrderRequest;
import com.egrocery.store.dto.request.StockUpdateRequest;
import com.egrocery.store.dto.request.UpdateOrderStatusRequest;
import com.egrocery.store.dto.response.DeliveryEstimateResponse;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.OrderResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.Address;
import com.egrocery.store.entity.Cart;
import com.egrocery.store.entity.CartItem;
import com.egrocery.store.entity.Coupon;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.OrderItem;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.DeliveryType;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.entity.enums.StockMovementType;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.AddressRepository;
import com.egrocery.store.repository.CartRepository;
import com.egrocery.store.repository.OrderRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.service.CartService;
import com.egrocery.store.service.CouponService;
import com.egrocery.store.service.DeliveryService;
import com.egrocery.store.service.InventoryService;
import com.egrocery.store.service.OrderService;
import com.egrocery.store.util.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Set<OrderStatus> CUSTOMER_CANCELLABLE_STATUSES = Set.of(OrderStatus.PLACED, OrderStatus.ACCEPTED);
    private static final int PICKUP_PREP_MINUTES = 30;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final DeliveryService deliveryService;
    private final InventoryService inventoryService;

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        BigDecimal itemsTotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            var product = cartItem.getProduct();
            int availableStock = product.getInventory() != null ? product.getInventory().getCurrentStock() : 0;

            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BadRequestException("\"" + product.getName() + "\" is no longer available");
            }
            if (cartItem.getQuantity() > availableStock) {
                throw new BadRequestException("Only " + availableStock + " unit(s) of \"" + product.getName() + "\" left in stock");
            }
            itemsTotal = itemsTotal.add(product.getSellingPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        Coupon appliedCoupon = cart.getAppliedCoupon();
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (appliedCoupon != null) {
            // Re-validated authoritatively here (dates/limits may have changed since it was applied to the cart).
            discountAmount = couponService.calculateDiscount(appliedCoupon, userId, itemsTotal);
        }

        Order.OrderBuilder orderBuilder = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .deliveryType(request.getDeliveryType())
                .itemsTotal(itemsTotal)
                .discountAmount(discountAmount)
                .couponCode(appliedCoupon != null ? appliedCoupon.getCode() : null)
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PLACED);

        if (request.getDeliveryType() == DeliveryType.HOME_DELIVERY) {
            if (request.getAddressId() == null) {
                throw new BadRequestException("An address is required for home delivery");
            }
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
            DeliveryEstimateResponse estimate = deliveryService.estimateForCustomerAddress(userId, address.getId());

            orderBuilder
                    .addressLine(address.getAddressLine())
                    .city(address.getCity())
                    .state(address.getState())
                    .pincode(address.getPincode())
                    .latitude(address.getLatitude())
                    .longitude(address.getLongitude())
                    .distanceKm(estimate.getDistanceKm())
                    .deliveryCharge(estimate.getDeliveryFee())
                    .estimatedDeliveryMinutes(estimate.getEstimatedDeliveryMinutes())
                    .totalAmount(clampToZero(itemsTotal.add(estimate.getDeliveryFee()).subtract(discountAmount)));
        } else {
            orderBuilder
                    .deliveryCharge(BigDecimal.ZERO)
                    .estimatedDeliveryMinutes(PICKUP_PREP_MINUTES)
                    .totalAmount(clampToZero(itemsTotal.subtract(discountAmount)));
        }

        Order order = orderBuilder.build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            var product = cartItem.getProduct();
            String primaryImage = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImage(primaryImage)
                    .unitPrice(product.getSellingPrice())
                    .quantity(cartItem.getQuantity())
                    .subtotal(product.getSellingPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            orderItems.add(orderItem);
        }
        order.setItems(orderItems);

        order = orderRepository.save(order);

        for (OrderItem orderItem : order.getItems()) {
            inventoryService.updateStock(orderItem.getProduct().getId(), StockUpdateRequest.builder()
                    .changeType(StockMovementType.SALE)
                    .quantity(orderItem.getQuantity())
                    .reason("Order " + order.getOrderNumber())
                    .build());
        }

        if (appliedCoupon != null) {
            couponService.recordRedemption(appliedCoupon, user, order);
        }

        cartService.clearCart(userId);

        return OrderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderListItemResponse> getMyOrders(Long userId, int page, int size) {
        Pageable pageable = pageable(page, size);
        return PageResponse.from(orderRepository.findByUserId(userId, pageable).map(OrderMapper::toListItem));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return OrderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelMyOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!CUSTOMER_CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new BadRequestException("This order can no longer be cancelled");
        }

        restockOrder(order);
        order.setStatus(OrderStatus.CANCELLED);
        return OrderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderListItemResponse> getAllOrders(OrderStatus status, int page, int size) {
        Pageable pageable = pageable(page, size);
        var result = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return PageResponse.from(result.map(OrderMapper::toListItem));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderForAdmin(Long orderId) {
        return OrderMapper.toOrderResponse(findOrThrow(orderId));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = findOrThrow(orderId);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already in a terminal state and cannot be updated");
        }

        if (request.getStatus() == OrderStatus.CANCELLED) {
            restockOrder(order);
        }

        order.setStatus(request.getStatus());
        return OrderMapper.toOrderResponse(orderRepository.save(order));
    }

    private void restockOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() == null) {
                continue; // product was later removed from the catalog; nothing to restock against
            }
            inventoryService.updateStock(item.getProduct().getId(), StockUpdateRequest.builder()
                    .changeType(StockMovementType.RETURN)
                    .quantity(item.getQuantity())
                    .reason("Order " + order.getOrderNumber() + " cancelled")
                    .build());
        }
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        SecureRandom random = new SecureRandom();

        String candidate;
        int attempts = 0;
        do {
            int suffix = 100000 + random.nextInt(900000);
            candidate = "ORD-" + datePart + "-" + suffix;
            attempts++;
        } while (orderRepository.existsByOrderNumber(candidate) && attempts < 5);

        return candidate;
    }

    private BigDecimal clampToZero(BigDecimal amount) {
        return amount.signum() < 0 ? BigDecimal.ZERO : amount;
    }

    private Pageable pageable(int page, int size) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "placedAt"));
    }

    private Order findOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}