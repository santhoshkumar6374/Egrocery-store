package com.egrocery.store.controller;

import com.egrocery.store.dto.request.UpdatePaymentStatusRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.PaymentResponse;
import com.egrocery.store.entity.enums.PaymentStatus;
import com.egrocery.store.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Payments (Admin)", description = "View all payments and mark Cash on Delivery as collected")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> list(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getAllForAdmin(status, page, size)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> forOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsForOrderAdmin(orderId)));
    }

    /** Mainly for Cash on Delivery: mark the payment SUCCESS once cash is collected at delivery/pickup. */
    @PatchMapping("/{paymentId}/status")
    public ResponseEntity<ApiResponse<PaymentResponse>> updateStatus(@PathVariable Long paymentId,
                                                                     @Valid @RequestBody UpdatePaymentStatusRequest request) {
        PaymentResponse updated = paymentService.updateStatusByAdmin(paymentId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment status updated", updated));
    }
}