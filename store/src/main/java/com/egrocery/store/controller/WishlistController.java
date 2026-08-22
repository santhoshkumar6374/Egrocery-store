package com.egrocery.store.controller;

import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.WishlistItemResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.WishlistService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Save products to buy later")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> list(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlist(principal.getId())));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> add(@AuthenticationPrincipal CustomUserDetails principal,
                                                                 @PathVariable Long productId) {
        WishlistItemResponse item = wishlistService.addToWishlist(principal.getId(), productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Added to wishlist", item));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(@AuthenticationPrincipal CustomUserDetails principal,
                                                    @PathVariable Long productId) {
        wishlistService.removeFromWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }
}