package com.egrocery.store.service;

import com.egrocery.store.dto.request.CouponRequest;
import com.egrocery.store.dto.response.CouponResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.Coupon;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.User;

import java.math.BigDecimal;

public interface CouponService {

    /** Looks up an ACTIVE coupon by code. Throws if missing/inactive — used by the cart "apply coupon" flow. */
    Coupon getActiveCouponByCode(String code);

    /**
     * Validates the coupon is eligible for this user/order total right now (dates, minimum
     * order amount, usage limit, one-per-user) and returns the rupee discount it grants.
     * Throws BadRequestException if not eligible. Does NOT consume a usage slot — call
     * {@link #recordRedemption} once the order is actually placed.
     */
    BigDecimal calculateDiscount(Coupon coupon, Long userId, BigDecimal orderTotal);

    /** Marks the coupon as consumed for this user/order: increments usedCount and logs a CouponUsage row. */
    void recordRedemption(Coupon coupon, User user, Order order);

    PageResponse<CouponResponse> getAllForAdmin(int page, int size);

    CouponResponse getByIdForAdmin(Long id);

    CouponResponse create(CouponRequest request);

    CouponResponse update(Long id, CouponRequest request);

    void delete(Long id);
}