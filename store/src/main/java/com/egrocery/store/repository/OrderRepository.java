package com.egrocery.store.repository;

import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.repository.projection.CustomerPurchaseProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    boolean existsByOrderNumber(String orderNumber);

    Optional<Order> findByOrderNumber(String orderNumber);

    // ---------- Dashboard ----------

    long countByStatusNotIn(List<OrderStatus> statuses);

    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> 'CANCELLED'")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status <> 'CANCELLED'")
    BigDecimal sumTotalRevenue();

    // ---------- Reports: sales over a date range ----------

    List<Order> findByPlacedAtBetweenAndStatusNot(LocalDateTime start, LocalDateTime end, OrderStatus excludedStatus);

    @Query("select count(o) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> 'CANCELLED'")
    long countValidOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ---------- Reports: revenue breakdown ----------

    @Query("select coalesce(sum(o.itemsTotal), 0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> 'CANCELLED'")
    BigDecimal sumItemsTotalBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(o.deliveryCharge), 0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> 'CANCELLED'")
    BigDecimal sumDeliveryChargeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(o.discountAmount), 0) from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> 'CANCELLED'")
    BigDecimal sumDiscountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // ---------- Reports: per-customer purchase totals ----------

    @Query("select o.user.id as customerId, o.user.name as customerName, o.user.email as customerEmail, " +
            "count(o) as totalOrders, sum(o.totalAmount) as totalSpent " +
            "from Order o where o.placedAt >= :start and o.placedAt < :end and o.status <> 'CANCELLED' " +
            "group by o.user.id, o.user.name, o.user.email order by sum(o.totalAmount) desc")
    List<CustomerPurchaseProjection> findCustomerPurchases(@Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end,
                                                           Pageable pageable);

    // ---------- Admin customer detail: a single customer's lifetime stats ----------

    @Query("select count(o) from Order o where o.user.id = :userId and o.status <> 'CANCELLED'")
    long countValidOrdersByUserId(@Param("userId") Long userId);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.user.id = :userId and o.status <> 'CANCELLED'")
    BigDecimal sumSpentByUserId(@Param("userId") Long userId);

    boolean existsByUserId(Long userId);
}