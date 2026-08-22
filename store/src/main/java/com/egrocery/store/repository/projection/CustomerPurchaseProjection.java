package com.egrocery.store.repository.projection;

import java.math.BigDecimal;

public interface CustomerPurchaseProjection {
    Long getCustomerId();
    String getCustomerName();
    String getCustomerEmail();
    Long getTotalOrders();
    BigDecimal getTotalSpent();
}