package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * Lean product view fed to the AI assistant's tool-call results. Deliberately
 * smaller than ProductResponse to keep the model's context usage low.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiProductView {

    private Long productId;
    private String name;
    private String category;
    private String brand;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private Integer discountPercent;
    private String unit;
    private Double weightValue;
    private boolean inStock;
    private Integer stockQuantity;
    private String description;
}