package com.egrocery.store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.razorpay")
public class RazorpayProperties {

    /** Public key, safe to hand to the frontend Checkout widget. */
    private String keyId;

    /** Secret key, used server-side only to create orders and verify signatures. */
    private String keySecret;
}