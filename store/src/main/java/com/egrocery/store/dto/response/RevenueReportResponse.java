package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {

    private LocalDate from;
    private LocalDate to;
    private long orderCount;
    private BigDecimal grossItemsRevenue;
    private BigDecimal deliveryFeesCollected;
    private BigDecimal discountsGiven;
    private BigDecimal netRevenue;
}