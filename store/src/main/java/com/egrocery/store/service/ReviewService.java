package com.egrocery.store.service;

import com.egrocery.store.dto.request.ReviewRequest;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ReviewResponse;
import com.egrocery.store.dto.response.ReviewSummaryResponse;

public interface ReviewService {

    /** Creates the customer's review for this product, or updates their existing one. */
    ReviewResponse addOrUpdateReview(Long userId, Long productId, ReviewRequest request);

    PageResponse<ReviewResponse> getProductReviews(Long productId, int page, int size);

    ReviewSummaryResponse getProductRatingSummary(Long productId);

    void deleteMyReview(Long userId, Long reviewId);

    void deleteReviewAsAdmin(Long reviewId);
}