package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerPurchaseReportResponse {

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private long totalOrders;
    private BigDecimal totalSpent;
}