package com.egrocery.store.service;

import java.math.BigDecimal;

/**
 * Thin wrapper around the Razorpay Java SDK so the rest of the app only deals
 * with plain types. Requires RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to be set
 * for the online-payment endpoints; Cash on Delivery never calls this.
 */
public interface RazorpayGatewayService {

    /** Creates a Razorpay order for the given rupee amount and returns its gateway order id. */
    String createOrder(BigDecimal amountInRupees, String receipt);

    /** Verifies the checkout-widget callback signature against the configured secret. */
    boolean verifySignature(String gatewayOrderId, String gatewayPaymentId, String signature);
}