package com.egrocery.store.util;

import com.egrocery.store.dto.response.CartItemResponse;
import com.egrocery.store.dto.response.CartResponse;
import com.egrocery.store.entity.CartItem;
import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.enums.ProductStatus;

import java.math.BigDecimal;
import java.util.List;

public final class CartMapper {

    private CartMapper() {
    }

    public static CartItemResponse toCartItemResponse(CartItem item) {
        Product product = item.getProduct();
        int currentStock = product.getInventory() != null ? product.getInventory().getCurrentStock() : 0;
        boolean available = product.getStatus() == ProductStatus.ACTIVE && currentStock >= item.getQuantity();
        String primaryImage = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();

        BigDecimal subtotal = product.getSellingPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(primaryImage)
                .unitPrice(product.getSellingPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .availableStock(currentStock)
                .available(available)
                .build();
    }

    public static CartResponse toCartResponse(List<CartItem> items, String couponCode, BigDecimal discountAmount) {
        List<CartItemResponse> responses = items.stream().map(CartMapper::toCartItemResponse).toList();

        BigDecimal itemsTotal = responses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = responses.stream().mapToInt(CartItemResponse::getQuantity).sum();
        boolean hasUnavailable = responses.stream().anyMatch(r -> !r.isAvailable());

        BigDecimal discount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        BigDecimal payableTotal = itemsTotal.subtract(discount);
        if (payableTotal.signum() < 0) {
            payableTotal = BigDecimal.ZERO;
        }

        return CartResponse.builder()
                .items(responses)
                .totalItems(totalItems)
                .itemsTotal(itemsTotal)
                .hasUnavailableItems(hasUnavailable)
                .couponCode(couponCode)
                .discountAmount(discount)
                .payableTotal(payableTotal)
                .build();
    }
}