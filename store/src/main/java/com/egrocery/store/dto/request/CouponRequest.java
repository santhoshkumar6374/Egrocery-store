package com.egrocery.store.dto.request;

import com.egrocery.store.entity.enums.CouponStatus;
import com.egrocery.store.entity.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Size(max = 30)
    private String code;

    @Size(max = 255)
    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.0", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.0", message = "Max discount amount cannot be negative")
    private BigDecimal maxDiscountAmount;

    @Min(value = 1, message = "Usage limit must be at least 1 if provided")
    private Integer usageLimit;

    @Builder.Default
    private boolean onePerUser = true;

    @NotNull(message = "Valid-from date is required")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid-until date is required")
    private LocalDateTime validUntil;

    private CouponStatus status;
}