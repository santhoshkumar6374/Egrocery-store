package com.egrocery.store.controller;

import com.egrocery.store.dto.request.AddToCartRequest;
import com.egrocery.store.dto.request.ApplyCouponRequest;
import com.egrocery.store.dto.request.UpdateCartItemRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.CartResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.CartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Add, update, and remove items from the logged-in customer's cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(principal.getId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@AuthenticationPrincipal CustomUserDetails principal,
                                                             @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(@AuthenticationPrincipal CustomUserDetails principal,
                                                                @PathVariable Long itemId,
                                                                @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateItem(principal.getId(), itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@AuthenticationPrincipal CustomUserDetails principal,
                                                                @PathVariable Long itemId) {
        CartResponse cart = cartService.removeItem(principal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @PostMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(@AuthenticationPrincipal CustomUserDetails principal,
                                                                 @Valid @RequestBody ApplyCouponRequest request) {
        CartResponse cart = cartService.applyCoupon(principal.getId(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Coupon applied", cart));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon(@AuthenticationPrincipal CustomUserDetails principal) {
        CartResponse cart = cartService.removeCoupon(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Coupon removed", cart));
    }
}