package com.egrocery.store.entity.enums;

/**
 * Order lifecycle. PACK_MY_ORDER (in-store pickup) flows skip OUT_FOR_DELIVERY.
 */
public enum OrderStatus {
    PLACED,
    ACCEPTED,
    PACKED,
    READY_FOR_PICKUP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}