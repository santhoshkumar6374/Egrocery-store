package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliverySettingsResponse {

    private BigDecimal baseCharge;
    private BigDecimal pricePerKm;
    private BigDecimal freeDeliveryAboveAmount;
    private Double maxDeliveryDistanceKm;
}