package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.entity.enums.ProductUnit;
import lombok.*;

import java.math.BigDecimal;

/**
 * Lighter-weight product representation used for paginated browse/search lists.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListItemResponse {

    private Long id;
    private String name;
    private String categoryName;
    private String brand;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private Integer discountPercent;
    private ProductUnit unit;
    private Double weightValue;
    private String primaryImageUrl;
    private boolean inStock;
    private ProductStatus status;
}