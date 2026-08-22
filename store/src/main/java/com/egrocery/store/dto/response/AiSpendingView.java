package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSpendingView {

    private BigDecimal totalSpentThisMonth;
    private long orderCountThisMonth;
}