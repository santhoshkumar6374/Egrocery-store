package com.egrocery.store.service.impl;

import com.egrocery.store.dto.response.WishlistItemResponse;
import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.WishlistItem;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.repository.WishlistItemRepository;
import com.egrocery.store.service.WishlistService;
import com.egrocery.store.util.WishlistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public List<WishlistItemResponse> getWishlist(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByAddedAtDesc(userId).stream()
                .map(WishlistMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public WishlistItemResponse addToWishlist(Long userId, Long productId) {
        return wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .map(WishlistMapper::toResponse)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                    WishlistItem saved = wishlistItemRepository.save(WishlistItem.builder()
                            .user(user)
                            .product(product)
                            .build());
                    return WishlistMapper.toResponse(saved);
                });
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(wishlistItemRepository::delete);
    }
}