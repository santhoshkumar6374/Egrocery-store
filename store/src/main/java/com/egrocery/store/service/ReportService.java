package com.egrocery.store.service;

import com.egrocery.store.dto.response.BestSellingProductResponse;
import com.egrocery.store.dto.response.CustomerPurchaseReportResponse;
import com.egrocery.store.dto.response.RevenueReportResponse;
import com.egrocery.store.dto.response.SalesReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    SalesReportResponse getSalesReport(LocalDate from, LocalDate to);

    List<BestSellingProductResponse> getBestSellingProducts(LocalDate from, LocalDate to, int limit);

    RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to);

    List<CustomerPurchaseReportResponse> getCustomerPurchaseReport(LocalDate from, LocalDate to, int limit);
}