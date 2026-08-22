package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.AddToCartRequest;
import com.egrocery.store.dto.request.UpdateCartItemRequest;
import com.egrocery.store.dto.response.CartResponse;
import com.egrocery.store.entity.Cart;
import com.egrocery.store.entity.CartItem;
import com.egrocery.store.entity.Coupon;
import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.CartItemRepository;
import com.egrocery.store.repository.CartRepository;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.service.CartService;
import com.egrocery.store.service.CouponService;
import com.egrocery.store.util.CartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;

    @Transactional(readOnly = true)
    @Override
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return buildResponse(cart, userId);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("This product is currently unavailable");
        }

        int availableStock = product.getInventory() != null ? product.getInventory().getCurrentStock() : 0;

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        int desiredQuantity = (item != null ? item.getQuantity() : 0) + request.getQuantity();
        if (desiredQuantity > availableStock) {
            throw new BadRequestException("Only " + availableStock + " unit(s) of \"" + product.getName() + "\" available in stock");
        }

        if (item == null) {
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(item);
        } else {
            item.setQuantity(desiredQuantity);
        }

        cartItemRepository.save(item);
        return buildResponse(reload(userId), userId);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        CartItem item = getOwnedItemOrThrow(userId, itemId);

        int availableStock = item.getProduct().getInventory() != null
                ? item.getProduct().getInventory().getCurrentStock() : 0;

        if (request.getQuantity() > availableStock) {
            throw new BadRequestException("Only " + availableStock + " unit(s) of \"" + item.getProduct().getName() + "\" available in stock");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return buildResponse(reload(userId), userId);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        CartItem item = getOwnedItemOrThrow(userId, itemId);
        Cart cart = item.getCart();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return buildResponse(cart, userId);
    }

    @Override
    @Transactional
    public CartResponse applyCoupon(Long userId, String code) {
        Cart cart = getOrCreateCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Add items to your cart before applying a coupon");
        }

        Coupon coupon = couponService.getActiveCouponByCode(code);
        BigDecimal itemsTotal = cart.getItems().stream()
                .map(i -> i.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Validates eligibility now; throws BadRequestException if not eligible. The discount
        // itself is recalculated fresh every time the cart is fetched, so we don't store it.
        couponService.calculateDiscount(coupon, userId, itemsTotal);

        cart.setAppliedCoupon(coupon);
        cartRepository.save(cart);

        return buildResponse(cart, userId);
    }

    @Override
    @Transactional
    public CartResponse removeCoupon(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.setAppliedCoupon(null);
        cartRepository.save(cart);
        return buildResponse(cart, userId);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cart.setAppliedCoupon(null);
        cartRepository.save(cart);
    }

    private CartResponse buildResponse(Cart cart, Long userId) {
        if (cart.getItems().isEmpty() || cart.getAppliedCoupon() == null) {
            return CartMapper.toCartResponse(cart.getItems(), null, BigDecimal.ZERO);
        }

        BigDecimal itemsTotal = cart.getItems().stream()
                .map(i -> i.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        try {
            BigDecimal discount = couponService.calculateDiscount(cart.getAppliedCoupon(), userId, itemsTotal);
            return CartMapper.toCartResponse(cart.getItems(), cart.getAppliedCoupon().getCode(), discount);
        } catch (RuntimeException ex) {
            // The applied coupon is no longer eligible (expired, limit hit, cart total dropped
            // below the minimum, etc). Silently drop it rather than blocking the whole cart view.
            cart.setAppliedCoupon(null);
            cartRepository.save(cart);
            return CartMapper.toCartResponse(cart.getItems(), null, BigDecimal.ZERO);
        }
    }

    private CartItem getOwnedItemOrThrow(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this cart item");
        }
        return item;
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            return cartRepository.save(Cart.builder().user(user).build());
        });
    }

    private Cart reload(Long userId) {
        return cartRepository.findByUserId(userId).orElseThrow();
    }
}