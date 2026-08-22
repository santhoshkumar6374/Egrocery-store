package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOrderView {

    private String orderNumber;
    private String status;
    private LocalDateTime placedAt;
    private BigDecimal totalAmount;
    private List<AiOrderItemView> items;
}