package com.egrocery.store.service;

import com.egrocery.store.dto.response.WishlistItemResponse;

import java.util.List;

public interface WishlistService {

    List<WishlistItemResponse> getWishlist(Long userId);

    WishlistItemResponse addToWishlist(Long userId, Long productId);

    void removeFromWishlist(Long userId, Long productId);
}