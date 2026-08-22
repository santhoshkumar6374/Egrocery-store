package com.egrocery.store.service.impl;

import com.egrocery.store.dto.response.*;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.OrderItem;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.repository.OrderItemRepository;
import com.egrocery.store.repository.OrderRepository;
import com.egrocery.store.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public SalesReportResponse getSalesReport(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findByPlacedAtBetweenAndStatusNot(start, end, OrderStatus.CANCELLED);

        // Pre-fill every date in the range so the chart on the frontend doesn't have gaps.
        Map<LocalDate, long[]> orderCountByDate = new LinkedHashMap<>();
        Map<LocalDate, BigDecimal> revenueByDate = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            orderCountByDate.put(d, new long[]{0});
            revenueByDate.put(d, BigDecimal.ZERO);
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (Order order : orders) {
            LocalDate day = order.getPlacedAt().toLocalDate();
            orderCountByDate.computeIfAbsent(day, d -> new long[]{0})[0]++;
            revenueByDate.merge(day, order.getTotalAmount(), BigDecimal::add);
            totalRevenue = totalRevenue.add(order.getTotalAmount());
            for (OrderItem item : order.getItems()) {
                totalItemsSold += item.getQuantity();
            }
        }

        List<DailySalesPointResponse> breakdown = orderCountByDate.keySet().stream()
                .sorted()
                .map(d -> DailySalesPointResponse.builder()
                        .date(d)
                        .orders(orderCountByDate.get(d)[0])
                        .revenue(revenueByDate.getOrDefault(d, BigDecimal.ZERO))
                        .build())
                .toList();

        return SalesReportResponse.builder()
                .from(from)
                .to(to)
                .totalOrders(orders.size())
                .totalRevenue(totalRevenue)
                .totalItemsSold(totalItemsSold)
                .dailyBreakdown(breakdown)
                .build();
    }

    @Override
    public List<BestSellingProductResponse> getBestSellingProducts(LocalDate from, LocalDate to, int limit) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        return orderItemRepository.findBestSelling(start, end, PageRequest.of(0, Math.min(Math.max(limit, 1), 100))).stream()
                .map(p -> BestSellingProductResponse.builder()
                        .productId(p.getProductId())
                        .productName(p.getProductName())
                        .quantitySold(p.getTotalQuantitySold())
                        .revenue(p.getTotalRevenue())
                        .build())
                .toList();
    }

    @Override
    public RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        return RevenueReportResponse.builder()
                .from(from)
                .to(to)
                .orderCount(orderRepository.countValidOrdersBetween(start, end))
                .grossItemsRevenue(orderRepository.sumItemsTotalBetween(start, end))
                .deliveryFeesCollected(orderRepository.sumDeliveryChargeBetween(start, end))
                .discountsGiven(orderRepository.sumDiscountBetween(start, end))
                .netRevenue(orderRepository.sumRevenueBetween(start, end))
                .build();
    }

    @Override
    public List<CustomerPurchaseReportResponse> getCustomerPurchaseReport(LocalDate from, LocalDate to, int limit) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        return orderRepository.findCustomerPurchases(start, end, PageRequest.of(0, Math.min(Math.max(limit, 1), 200))).stream()
                .map(p -> CustomerPurchaseReportResponse.builder()
                        .customerId(p.getCustomerId())
                        .customerName(p.getCustomerName())
                        .customerEmail(p.getCustomerEmail())
                        .totalOrders(p.getTotalOrders())
                        .totalSpent(p.getTotalSpent())
                        .build())
                .toList();
    }
}