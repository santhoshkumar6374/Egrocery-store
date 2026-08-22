package com.egrocery.store.repository;

import com.egrocery.store.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("select i from Inventory i where i.currentStock <= i.lowStockThreshold and i.currentStock > 0")
    java.util.List<Inventory> findLowStock();

    @Query("select i from Inventory i where i.currentStock <= 0")
    java.util.List<Inventory> findOutOfStock();
}