package com.egrocery.store.service.impl;

import com.egrocery.store.config.RazorpayProperties;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.service.RazorpayGatewayService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayGatewayServiceImpl implements RazorpayGatewayService {

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;

    @Override
    public String createOrder(BigDecimal amountInRupees, String receipt) {
        try {
            // Razorpay expects the amount in the smallest currency unit (paise for INR).
            long amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100)).longValueExact();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);
            return order.get("id");
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for receipt {}: {}", receipt, e.getMessage());
            throw new BadRequestException("Could not start the online payment. Please try again or choose Cash on Delivery.");
        }
    }

    @Override
    public boolean verifySignature(String gatewayOrderId, String gatewayPaymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", gatewayOrderId);
            options.put("razorpay_payment_id", gatewayPaymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, razorpayProperties.getKeySecret());
        } catch (RazorpayException e) {
            log.warn("Razorpay signature verification failed: {}", e.getMessage());
            return false;
        }
    }
}