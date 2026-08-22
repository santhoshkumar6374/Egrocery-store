package com.egrocery.store.entity.enums;

/**
 * Reason an inventory quantity changed, recorded in InventoryHistory for audit purposes.
 */
public enum StockMovementType {
    STOCK_IN,     // new stock received from supplier
    STOCK_OUT,    // manual removal (damage, expiry, etc.)
    ADJUSTMENT,   // manual correction after a stock count
    SALE,         // decremented by an order (wired up in Phase 3)
    RETURN        // stock returned to inventory
}