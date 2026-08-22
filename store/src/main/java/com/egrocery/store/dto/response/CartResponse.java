package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal itemsTotal;
    private boolean hasUnavailableItems;

    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal payableTotal;
}