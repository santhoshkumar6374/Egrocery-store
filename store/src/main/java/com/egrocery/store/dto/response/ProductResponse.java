package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.entity.enums.ProductUnit;
import com.egrocery.store.entity.enums.StockStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private CategorySummaryResponse category;
    private String brand;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private Integer discountPercent;
    private ProductUnit unit;
    private Double weightValue;
    private String description;
    private ProductStatus status;
    private List<ProductImageResponse> images;
    private Integer currentStock;
    private Integer lowStockThreshold;
    private StockStatus stockStatus;
}