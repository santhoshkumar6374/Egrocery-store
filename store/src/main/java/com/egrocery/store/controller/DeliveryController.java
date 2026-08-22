package com.egrocery.store.controller;

import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.DeliveryEstimateResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.DeliveryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Lets a customer preview the delivery fee/distance/ETA for a saved address
 * before placing the order.
 */
@RestController
@RequestMapping("/api/customer/delivery")
@RequiredArgsConstructor
@Tag(name = "Delivery Estimate", description = "Preview delivery fee and distance for the checkout screen")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/estimate")
    public ResponseEntity<ApiResponse<DeliveryEstimateResponse>> estimate(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam Long addressId) {
        DeliveryEstimateResponse estimate = deliveryService.estimateForCustomerAddress(principal.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success(estimate));
    }
}