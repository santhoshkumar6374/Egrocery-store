package com.egrocery.store.service;

import com.egrocery.store.dto.request.AddToCartRequest;
import com.egrocery.store.dto.request.UpdateCartItemRequest;
import com.egrocery.store.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, AddToCartRequest request);

    CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, Long itemId);

    CartResponse applyCoupon(Long userId, String code);

    CartResponse removeCoupon(Long userId);

    void clearCart(Long userId);
}