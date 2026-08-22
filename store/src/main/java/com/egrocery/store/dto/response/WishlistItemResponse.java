package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private Integer discountPercent;
    private boolean inStock;
    private LocalDateTime addedAt;
}