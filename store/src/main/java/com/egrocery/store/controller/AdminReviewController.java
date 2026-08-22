package com.egrocery.store.controller;

import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ReviewResponse;
import com.egrocery.store.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews (Admin)", description = "Moderate reviews left on a product")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> list(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId, page, size)));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long productId, @PathVariable Long reviewId) {
        reviewService.deleteReviewAsAdmin(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review removed", null));
    }
}