package com.egrocery.store.controller;

import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ReviewResponse;
import com.egrocery.store.dto.response.ReviewSummaryResponse;
import com.egrocery.store.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public, read-only review browsing for the product detail page.
 */
@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews (Public)", description = "Browse a product's reviews and rating summary")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId, page, size)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> summary(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductRatingSummary(productId)));
    }
}