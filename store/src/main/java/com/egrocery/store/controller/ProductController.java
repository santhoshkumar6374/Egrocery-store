package com.egrocery.store.controller;

import com.egrocery.store.dto.request.ProductSortOption;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ProductListItemResponse;
import com.egrocery.store.dto.response.ProductResponse;
import com.egrocery.store.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Public, customer-facing product browsing: search, filter, sort, paginate.
 * Only ever returns ACTIVE products.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products (Public)", description = "Browse, search and filter active products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductListItemResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDiscount,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) ProductSortOption sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<ProductListItemResponse> result = productService.search(
                keyword, categoryId, brand, minPrice, maxPrice, minDiscount, inStockOnly, sort, page, size, false);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id, false)));
    }
}