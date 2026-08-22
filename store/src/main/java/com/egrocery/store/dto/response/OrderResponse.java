package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.DeliveryType;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.entity.enums.PaymentMethod;
import com.egrocery.store.entity.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private DeliveryType deliveryType;

    // Only meaningful to the admin views (the customer's own "my order" view already knows
    // it's their own order); harmless extra fields for the customer-facing endpoints.
    private Long customerId;
    private String customerName;
    private String customerEmail;

    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private Double distanceKm;
    private Integer estimatedDeliveryMinutes;

    private BigDecimal itemsTotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discountAmount;
    private String couponCode;
    private BigDecimal totalAmount;

    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    private List<OrderItemResponse> items;

    private LocalDateTime placedAt;
    private LocalDateTime updatedAt;
}