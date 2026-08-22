package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.StockStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long productId;
    private String productName;
    private Integer currentStock;
    private Integer lowStockThreshold;
    private StockStatus stockStatus;
}