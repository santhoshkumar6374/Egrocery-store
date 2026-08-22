package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.CouponStatus;
import com.egrocery.store.entity.enums.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponse {

    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private boolean onePerUser;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private CouponStatus status;
}