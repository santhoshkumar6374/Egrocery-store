package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BestSellingProductResponse {

    private Long productId;
    private String productName;
    private long quantitySold;
    private BigDecimal revenue;
}