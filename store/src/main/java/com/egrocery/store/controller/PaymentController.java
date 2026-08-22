package com.egrocery.store.controller;

import com.egrocery.store.dto.request.VerifyPaymentRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.PaymentInitiateResponse;
import com.egrocery.store.dto.response.PaymentResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders/{orderId}/payments")
@RequiredArgsConstructor
@Tag(name = "Payments (Customer)", description = "Pay for an order via Razorpay (UPI/cards/net banking) or Cash on Delivery")
public class PaymentController {

    private final PaymentService paymentService;

    /** For COD this immediately confirms; for every other method it returns a Razorpay order to open in Checkout. */
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentInitiateResponse>> initiate(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.initiatePayment(principal.getId(), orderId)));
    }

    /** Called after the Razorpay Checkout widget succeeds, with the values it returns. */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verify(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long orderId,
            @Valid @RequestBody VerifyPaymentRequest request) {
        PaymentResponse response = paymentService.verifyPayment(principal.getId(), orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> list(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsForMyOrder(principal.getId(), orderId)));
    }
}