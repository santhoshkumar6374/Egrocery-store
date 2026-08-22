package com.egrocery.store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.shop")
public class ShopProperties {

    private String name;
    private double latitude;
    private double longitude;
}