package com.egrocery.store.service;

import com.egrocery.store.dto.request.DeliverySettingsRequest;
import com.egrocery.store.dto.response.DeliveryEstimateResponse;
import com.egrocery.store.dto.response.DeliverySettingsResponse;
import com.egrocery.store.entity.DeliveryCharge;

import java.math.BigDecimal;

public interface DeliveryService {

    DeliverySettingsResponse getSettings();

    DeliverySettingsResponse updateSettings(DeliverySettingsRequest request);

    /** Raw settings entity, used internally by OrderService when placing an order. */
    DeliveryCharge getSettingsEntity();

    DeliveryEstimateResponse estimate(double customerLat, double customerLng, BigDecimal cartTotal);

    /** Convenience for the checkout preview screen: resolves the user's saved address and current cart total. */
    DeliveryEstimateResponse estimateForCustomerAddress(Long userId, Long addressId);
}