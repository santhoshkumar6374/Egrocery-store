package com.egrocery.store.service.impl;

import com.egrocery.store.config.ShopProperties;
import com.egrocery.store.dto.request.DeliverySettingsRequest;
import com.egrocery.store.dto.response.DeliveryEstimateResponse;
import com.egrocery.store.dto.response.DeliverySettingsResponse;
import com.egrocery.store.entity.Address;
import com.egrocery.store.entity.DeliveryCharge;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.AddressRepository;
import com.egrocery.store.repository.DeliveryChargeRepository;
import com.egrocery.store.service.CartService;
import com.egrocery.store.service.DeliveryService;
import com.egrocery.store.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    /** Minutes added on top of packing time regardless of distance. */
    private static final int BASE_PREP_MINUTES = 20;
    /** Extra minutes per km of travel. */
    private static final int MINUTES_PER_KM = 4;

    private final DeliveryChargeRepository deliveryChargeRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final ShopProperties shopProperties;

    @Override
    public DeliverySettingsResponse getSettings() {
        DeliveryCharge settings = getSettingsEntity();
        return toResponse(settings);
    }

    @Override
    @Transactional
    public DeliverySettingsResponse updateSettings(DeliverySettingsRequest request) {
        DeliveryCharge settings = getSettingsEntity();
        settings.setBaseCharge(request.getBaseCharge());
        settings.setPricePerKm(request.getPricePerKm());
        settings.setFreeDeliveryAboveAmount(request.getFreeDeliveryAboveAmount());
        settings.setMaxDeliveryDistanceKm(request.getMaxDeliveryDistanceKm());
        return toResponse(deliveryChargeRepository.save(settings));
    }

    @Override
    public DeliveryCharge getSettingsEntity() {
        return deliveryChargeRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> deliveryChargeRepository.save(
                        DeliveryCharge.builder()
                                .baseCharge(BigDecimal.valueOf(20))
                                .pricePerKm(BigDecimal.valueOf(5))
                                .freeDeliveryAboveAmount(BigDecimal.valueOf(500))
                                .maxDeliveryDistanceKm(15.0)
                                .build()));
    }

    @Override
    public DeliveryEstimateResponse estimate(double customerLat, double customerLng, BigDecimal cartTotal) {
        DeliveryCharge settings = getSettingsEntity();

        double distanceKm = GeoUtil.distanceKm(
                shopProperties.getLatitude(), shopProperties.getLongitude(), customerLat, customerLng);

        if (settings.getMaxDeliveryDistanceKm() != null && distanceKm > settings.getMaxDeliveryDistanceKm()) {
            throw new BadRequestException(String.format(
                    "Sorry, that address is %.1f km away, outside our %.0f km delivery range. Try Pack My Order for in-store pickup instead.",
                    distanceKm, settings.getMaxDeliveryDistanceKm()));
        }

        boolean freeDeliveryApplied = cartTotal.compareTo(settings.getFreeDeliveryAboveAmount()) >= 0;

        BigDecimal deliveryFee;
        if (freeDeliveryApplied) {
            deliveryFee = BigDecimal.ZERO;
        } else {
            BigDecimal distanceCost = settings.getPricePerKm()
                    .multiply(BigDecimal.valueOf(distanceKm))
                    .setScale(2, RoundingMode.HALF_UP);
            deliveryFee = settings.getBaseCharge().add(distanceCost).setScale(2, RoundingMode.HALF_UP);
        }

        int estimatedMinutes = BASE_PREP_MINUTES + (int) Math.ceil(distanceKm * MINUTES_PER_KM);

        return DeliveryEstimateResponse.builder()
                .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                .cartTotal(cartTotal)
                .deliveryFee(deliveryFee)
                .freeDeliveryApplied(freeDeliveryApplied)
                .estimatedDeliveryMinutes(estimatedMinutes)
                .build();
    }

    @Override
    public DeliveryEstimateResponse estimateForCustomerAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this address");
        }

        double customerLat = address.getLatitude() != null ? address.getLatitude() : shopProperties.getLatitude();
        double customerLng = address.getLongitude() != null ? address.getLongitude() : shopProperties.getLongitude();

        BigDecimal cartTotal = cartService.getCart(userId).getItemsTotal();

        return estimate(customerLat, customerLng, cartTotal);
    }

    private DeliverySettingsResponse toResponse(DeliveryCharge settings) {
        return DeliverySettingsResponse.builder()
                .baseCharge(settings.getBaseCharge())
                .pricePerKm(settings.getPricePerKm())
                .freeDeliveryAboveAmount(settings.getFreeDeliveryAboveAmount())
                .maxDeliveryDistanceKm(settings.getMaxDeliveryDistanceKm())
                .build();
    }
}