package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReportResponse {

    private LocalDate from;
    private LocalDate to;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalItemsSold;
    private List<DailySalesPointResponse> dailyBreakdown;
}