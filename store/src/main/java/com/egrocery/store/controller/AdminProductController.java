package com.egrocery.store.controller;

import com.egrocery.store.dto.request.ProductRequest;
import com.egrocery.store.dto.request.ProductSortOption;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ProductListItemResponse;
import com.egrocery.store.dto.response.ProductResponse;
import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Tag(name = "Products (Admin)", description = "Admin product CRUD, status toggling, and image management")
public class AdminProductController {

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
                keyword, categoryId, brand, minPrice, maxPrice, minDiscount, inStockOnly, sort, page, size, true);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id, true)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Product created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id,
                                                                 @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> setStatus(@PathVariable Long id,
                                                                    @RequestParam ProductStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Product status updated", productService.setStatus(id, status)));
    }

    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProductResponse>> addImage(@PathVariable Long id,
                                                                   @RequestParam("file") MultipartFile file) {
        ProductResponse updated = productService.addImage(id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Image uploaded", updated));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        productService.deleteImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image removed", null));
    }
}