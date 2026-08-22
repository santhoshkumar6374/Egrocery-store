package com.egrocery.store.repository.projection;

import java.math.BigDecimal;

public interface BestSellingProjection {
    Long getProductId();
    String getProductName();
    Long getTotalQuantitySold();
    BigDecimal getTotalRevenue();
}