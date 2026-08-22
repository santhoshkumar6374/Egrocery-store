package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOrderItemView {

    private String productName;
    private int quantity;
    private BigDecimal unitPrice;
}