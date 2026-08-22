package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private BigDecimal todaySales;
    private BigDecimal monthlySales;
    private long totalOrders;
    private long pendingOrders;
    private long deliveredOrders;
    private long totalCustomers;
    private long totalProducts;
    private BigDecimal totalRevenue;
}