package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.CouponRequest;
import com.egrocery.store.dto.response.CouponResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.Coupon;
import com.egrocery.store.entity.CouponUsage;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.CouponStatus;
import com.egrocery.store.entity.enums.DiscountType;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.DuplicateResourceException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.CouponRepository;
import com.egrocery.store.repository.CouponUsageRepository;
import com.egrocery.store.service.CouponService;
import com.egrocery.store.util.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Override
    public Coupon getActiveCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ResourceNotFoundException("No coupon found with this code"));
        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new BadRequestException("This coupon is not active");
        }
        return coupon;
    }

    @Override
    public BigDecimal calculateDiscount(Coupon coupon, Long userId, BigDecimal orderTotal) {
        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new BadRequestException("This coupon is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getValidFrom()) || now.isAfter(coupon.getValidUntil())) {
            throw new BadRequestException("This coupon is not valid at this time");
        }

        if (orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("A minimum order value of \u20B9" + coupon.getMinOrderAmount() + " is required for this coupon");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("This coupon has reached its usage limit");
        }

        if (coupon.isOnePerUser() && couponUsageRepository.existsByCouponIdAndUserId(coupon.getId(), userId)) {
            throw new BadRequestException("You have already used this coupon");
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderTotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        // Never let the discount exceed the order total.
        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional
    public void recordRedemption(Coupon coupon, User user, Order order) {
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        couponUsageRepository.save(CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .order(order)
                .build());
    }

    @Override
    public PageResponse<CouponResponse> getAllForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(couponRepository.findAll(pageable).map(CouponMapper::toResponse));
    }

    @Override
    public CouponResponse getByIdForAdmin(Long id) {
        return CouponMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public CouponResponse create(CouponRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new DuplicateResourceException("A coupon with this code already exists");
        }
        validateDateRange(request);

        Coupon coupon = Coupon.builder()
                .code(normalizedCode)
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .onePerUser(request.isOnePerUser())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .status(request.getStatus() != null ? request.getStatus() : CouponStatus.ACTIVE)
                .build();

        return CouponMapper.toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon coupon = findOrThrow(id);
        String normalizedCode = request.getCode().trim().toUpperCase();

        if (!coupon.getCode().equalsIgnoreCase(normalizedCode) && couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new DuplicateResourceException("A coupon with this code already exists");
        }
        validateDateRange(request);

        coupon.setCode(normalizedCode);
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setOnePerUser(request.isOnePerUser());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        if (request.getStatus() != null) {
            coupon.setStatus(request.getStatus());
        }

        return CouponMapper.toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        couponRepository.delete(findOrThrow(id));
    }

    private void validateDateRange(CouponRequest request) {
        if (!request.getValidUntil().isAfter(request.getValidFrom())) {
            throw new BadRequestException("Valid-until date must be after the valid-from date");
        }
    }

    private Coupon findOrThrow(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
    }
}