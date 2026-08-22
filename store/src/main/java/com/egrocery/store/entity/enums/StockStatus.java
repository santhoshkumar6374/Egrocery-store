package com.egrocery.store.entity.enums;

/**
 * Computed (not persisted) view of a product's stock level, derived from
 * Inventory.currentStock vs Inventory.lowStockThreshold.
 */
public enum StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK
}