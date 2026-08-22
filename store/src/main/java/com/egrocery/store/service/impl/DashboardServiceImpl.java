package com.egrocery.store.service.impl;

import com.egrocery.store.dto.response.DashboardSummaryResponse;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.entity.enums.RoleName;
import com.egrocery.store.repository.OrderRepository;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final List<OrderStatus> COMPLETED_STATUSES = List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public DashboardSummaryResponse getSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfTomorrow = startOfToday.plusDays(1);
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);

        return DashboardSummaryResponse.builder()
                .todaySales(orderRepository.sumRevenueBetween(startOfToday, startOfTomorrow))
                .monthlySales(orderRepository.sumRevenueBetween(startOfMonth, startOfNextMonth))
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatusNotIn(COMPLETED_STATUSES))
                .deliveredOrders(orderRepository.countByStatus(OrderStatus.DELIVERED))
                .totalCustomers(userRepository.countByRoles_Name(RoleName.CUSTOMER))
                .totalProducts(productRepository.count())
                .totalRevenue(orderRepository.sumTotalRevenue())
                .build();
    }
}