package com.egrocery.store.controller;

import com.egrocery.store.dto.request.DeliverySettingsRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.DeliverySettingsResponse;
import com.egrocery.store.service.DeliveryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/delivery-settings")
@RequiredArgsConstructor
@Tag(name = "Delivery Settings (Admin)", description = "Configure base charge, price per km, and free delivery threshold")
public class AdminDeliverySettingsController {

    private final DeliveryService deliveryService;

    @GetMapping
    public ResponseEntity<ApiResponse<DeliverySettingsResponse>> get() {
        return ResponseEntity.ok(ApiResponse.success(deliveryService.getSettings()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<DeliverySettingsResponse>> update(@Valid @RequestBody DeliverySettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Delivery settings updated", deliveryService.updateSettings(request)));
    }
}