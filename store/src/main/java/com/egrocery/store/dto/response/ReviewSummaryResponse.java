package com.egrocery.store.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummaryResponse {

    private Long productId;
    private double averageRating;
    private long totalReviews;
}