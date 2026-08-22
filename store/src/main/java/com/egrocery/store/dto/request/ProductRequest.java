package com.egrocery.store.dto.request;

import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.entity.enums.ProductUnit;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @Size(max = 100)
    private String brand;

    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "MRP must be greater than 0")
    private BigDecimal mrp;

    @NotNull(message = "Discount percent is required")
    @Min(value = 0, message = "Discount cannot be negative")
    @Max(value = 90, message = "Discount cannot exceed 90%")
    private Integer discountPercent;

    @NotNull(message = "Unit is required")
    private ProductUnit unit;

    @NotNull(message = "Weight value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0")
    private Double weightValue;

    @Size(max = 2000)
    private String description;

    private ProductStatus status;

    /** Initial stock quantity, used only when creating a new product. */
    @Min(value = 0, message = "Initial stock cannot be negative")
    private Integer initialStock;

    @Min(value = 0, message = "Low stock threshold cannot be negative")
    private Integer lowStockThreshold;
}