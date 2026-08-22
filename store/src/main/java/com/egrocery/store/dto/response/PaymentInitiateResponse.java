package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;

/**
 * For COD: codConfirmed=true and there's nothing further for the frontend to do.
 * For every other method: the frontend opens the Razorpay Checkout widget using
 * razorpayOrderId + razorpayKeyId + amount, then POSTs the result to /verify.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInitiateResponse {

    private Long paymentId;
    private PaymentMethod method;
    private BigDecimal amount;
    private String currency;
    private boolean codConfirmed;
    private String razorpayOrderId;
    private String razorpayKeyId;
}