package com.egrocery.store.repository;

import com.egrocery.store.entity.OrderItem;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.repository.projection.BestSellingProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByProductId(Long productId);

    boolean existsByProduct_IdAndOrder_UserIdAndOrder_Status(Long productId, Long userId, OrderStatus status);

    @Query("select oi.product.id as productId, oi.productName as productName, " +
            "sum(oi.quantity) as totalQuantitySold, sum(oi.subtotal) as totalRevenue " +
            "from OrderItem oi where oi.order.placedAt >= :start and oi.order.placedAt < :end and oi.order.status <> 'CANCELLED' " +
            "group by oi.product.id, oi.productName order by sum(oi.quantity) desc")
    List<BestSellingProjection> findBestSelling(@Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end,
                                                Pageable pageable);
}