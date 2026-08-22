package com.egrocery.store.controller;

import com.egrocery.store.dto.request.ReviewRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.ReviewResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/products/{productId}/review")
@RequiredArgsConstructor
@Tag(name = "Reviews (Customer)", description = "Rate and review products from your delivered orders")
public class CustomerReviewController {

    private final ReviewService reviewService;

    @PutMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addOrUpdate(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = reviewService.addOrUpdateReview(principal.getId(), productId, request);
        return ResponseEntity.ok(ApiResponse.success("Review saved", review));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@AuthenticationPrincipal CustomUserDetails principal,
                                                    @PathVariable Long productId,
                                                    @PathVariable Long reviewId) {
        reviewService.deleteMyReview(principal.getId(), reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}