package com.egrocery.store.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliverySettingsRequest {

    @NotNull(message = "Base charge is required")
    @DecimalMin(value = "0.0", message = "Base charge cannot be negative")
    private BigDecimal baseCharge;

    @NotNull(message = "Price per km is required")
    @DecimalMin(value = "0.0", message = "Price per km cannot be negative")
    private BigDecimal pricePerKm;

    @NotNull(message = "Free delivery threshold is required")
    @DecimalMin(value = "0.0", message = "Free delivery threshold cannot be negative")
    private BigDecimal freeDeliveryAboveAmount;

    /** Optional — null/omitted means no distance limit. */
    @DecimalMin(value = "0.1", message = "Delivery radius must be greater than 0")
    private Double maxDeliveryDistanceKm;
}