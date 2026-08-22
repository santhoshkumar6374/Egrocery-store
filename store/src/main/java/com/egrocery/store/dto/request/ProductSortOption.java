package com.egrocery.store.dto.request;

public enum ProductSortOption {
    PRICE_LOW_HIGH,
    PRICE_HIGH_LOW,
    DISCOUNT_HIGH_LOW,
    NEWEST,
    /** Falls back to NEWEST until Order data exists (wired up in Phase 3). */
    BEST_SELLING
}