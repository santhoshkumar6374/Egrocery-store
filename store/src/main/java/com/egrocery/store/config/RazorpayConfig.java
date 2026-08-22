package com.egrocery.store.config;

import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RazorpayProperties.class)
@RequiredArgsConstructor
public class RazorpayConfig {

    private final RazorpayProperties razorpayProperties;

    /**
     * Constructing the client doesn't make a network call, so this is safe to build
     * even with blank keys during local dev — it will only fail when an online
     * payment is actually attempted without valid RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET.
     */
    @Bean
    public RazorpayClient razorpayClient() throws Exception {
        String keyId = razorpayProperties.getKeyId() != null ? razorpayProperties.getKeyId() : "";
        String keySecret = razorpayProperties.getKeySecret() != null ? razorpayProperties.getKeySecret() : "";
        return new RazorpayClient(keyId, keySecret);
    }
}