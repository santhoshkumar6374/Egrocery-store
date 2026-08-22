package com.egrocery.store.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Shop-wide delivery pricing settings. Single-row table (one shop = one config).
 */
@Entity
@Table(name = "delivery_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DeliveryCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKm;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal freeDeliveryAboveAmount;

    /** Null = no distance limit; otherwise orders/estimates beyond this are rejected. */
    private Double maxDeliveryDistanceKm;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}