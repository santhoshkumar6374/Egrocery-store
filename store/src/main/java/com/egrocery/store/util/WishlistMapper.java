package com.egrocery.store.util;

import com.egrocery.store.dto.response.WishlistItemResponse;
import com.egrocery.store.entity.WishlistItem;

public final class WishlistMapper {

    private WishlistMapper() {
    }

    public static WishlistItemResponse toResponse(WishlistItem item) {
        var product = item.getProduct();
        String primaryImage = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();
        int stock = product.getInventory() != null ? product.getInventory().getCurrentStock() : 0;

        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(primaryImage)
                .mrp(product.getMrp())
                .sellingPrice(product.getSellingPrice())
                .discountPercent(product.getDiscountPercent())
                .inStock(stock > 0)
                .addedAt(item.getAddedAt())
                .build();
    }
}