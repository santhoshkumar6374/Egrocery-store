package com.egrocery.store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.upload")
public class FileStorageProperties {

    /** Local filesystem directory where uploaded files are stored. */
    private String dir = "uploads/products";

    /** URL path prefix these files are served under (mapped in WebConfig). */
    private String urlPrefix = "/uploads/products";

    private long maxSizeBytes = 5 * 1024 * 1024; // 5MB

    /** Cloudinary configuration */
    private String cloudName;
    private String apiKey;
    private String apiSecret;
}