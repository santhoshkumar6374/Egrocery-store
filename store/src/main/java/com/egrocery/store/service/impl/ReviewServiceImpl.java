package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.ReviewRequest;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ReviewResponse;
import com.egrocery.store.dto.response.ReviewSummaryResponse;
import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.Review;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.OrderItemRepository;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.ReviewRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.service.ReviewService;
import com.egrocery.store.util.ReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public ReviewResponse addOrUpdateReview(Long userId, Long productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean purchasedAndDelivered = orderItemRepository
                .existsByProduct_IdAndOrder_UserIdAndOrder_Status(productId, userId, OrderStatus.DELIVERED);
        if (!purchasedAndDelivered) {
            throw new BadRequestException("You can only review products from a delivered order");
        }

        Review review = reviewRepository.findByUserIdAndProductId(userId, productId).orElse(null);

        if (review == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            review = Review.builder()
                    .product(product)
                    .user(user)
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .build();
        } else {
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        }

        return ReviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable).map(ReviewMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getProductRatingSummary(Long productId) {
        Double average = reviewRepository.findAverageRatingByProductId(productId);
        long total = reviewRepository.countByProductId(productId);

        return ReviewSummaryResponse.builder()
                .productId(productId)
                .averageRating(average != null ? Math.round(average * 10.0) / 10.0 : 0.0)
                .totalReviews(total)
                .build();
    }

    @Override
    @Transactional
    public void deleteMyReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this review");
        }
        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public void deleteReviewAsAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        reviewRepository.delete(review);
    }
}