package com.egrocery.store.service;

import com.egrocery.store.dto.request.ProductRequest;
import com.egrocery.store.dto.request.ProductSortOption;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ProductListItemResponse;
import com.egrocery.store.dto.response.ProductResponse;
import com.egrocery.store.entity.enums.ProductStatus;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface ProductService {

    PageResponse<ProductListItemResponse> search(String keyword,
                                                 Long categoryId,
                                                 String brand,
                                                 BigDecimal minPrice,
                                                 BigDecimal maxPrice,
                                                 Integer minDiscount,
                                                 Boolean inStockOnly,
                                                 ProductSortOption sort,
                                                 int page,
                                                 int size,
                                                 boolean adminView);

    ProductResponse getById(Long id, boolean adminView);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    ProductResponse setStatus(Long id, ProductStatus status);

    ProductResponse addImage(Long id, MultipartFile file);

    ProductResponse addImageUrl(Long id, String imageUrl);

    void deleteImage(Long productId, Long imageId);
}