package com.egrocery.store.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long productId;
    private String customerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}