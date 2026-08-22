package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.StockMovementType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryHistoryResponse {

    private Long id;
    private String productName;
    private StockMovementType changeType;
    private Integer quantityChanged;
    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private LocalDateTime createdAt;
}