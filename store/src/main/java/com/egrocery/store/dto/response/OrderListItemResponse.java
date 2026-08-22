package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.DeliveryType;
import com.egrocery.store.entity.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListItemResponse {

    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private DeliveryType deliveryType;
    private int itemCount;
    private BigDecimal totalAmount;
    private LocalDateTime placedAt;
}