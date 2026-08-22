package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryEstimateResponse {

    private double distanceKm;
    private BigDecimal cartTotal;
    private BigDecimal deliveryFee;
    private boolean freeDeliveryApplied;
    private int estimatedDeliveryMinutes;
}