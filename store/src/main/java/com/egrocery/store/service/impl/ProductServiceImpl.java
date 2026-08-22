package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.ProductRequest;
import com.egrocery.store.dto.request.ProductSortOption;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.dto.response.ProductListItemResponse;
import com.egrocery.store.dto.response.ProductResponse;
import com.egrocery.store.entity.Category;
import com.egrocery.store.entity.Inventory;
import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.ProductImage;
import com.egrocery.store.entity.enums.ProductStatus;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.CategoryRepository;
import com.egrocery.store.repository.InventoryHistoryRepository;
import com.egrocery.store.repository.InventoryRepository;
import com.egrocery.store.repository.OrderItemRepository;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.specification.ProductSpecification;
import com.egrocery.store.service.FileStorageService;
import com.egrocery.store.service.ProductService;
import com.egrocery.store.util.CatalogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    @Override
    public PageResponse<ProductListItemResponse> search(String keyword, Long categoryId, String brand,
                                                        BigDecimal minPrice, BigDecimal maxPrice,
                                                        Integer minDiscount, Boolean inStockOnly,
                                                        ProductSortOption sort, int page, int size,
                                                        boolean adminView) {

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), resolveSort(sort));

        // Customers only ever see ACTIVE products; admins can pass null to see everything.
        ProductStatus statusFilter = adminView ? null : ProductStatus.ACTIVE;

        Page<Product> result = productRepository.findAll(
                ProductSpecification.build(keyword, categoryId, brand, minPrice, maxPrice, minDiscount, inStockOnly, statusFilter),
                pageable
        );

        return PageResponse.from(result.map(CatalogMapper::toProductListItem));
    }

    @Transactional(readOnly = true)
    @Override
    public ProductResponse getById(Long id, boolean adminView) {
        Product product = findOrThrow(id);
        if (!adminView && product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException("Product not found");
        }
        return CatalogMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .category(category)
                .brand(request.getBrand())
                .mrp(request.getMrp())
                .discountPercent(request.getDiscountPercent())
                .sellingPrice(computeSellingPrice(request.getMrp(), request.getDiscountPercent()))
                .unit(request.getUnit())
                .weightValue(request.getWeightValue())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE)
                .build();

        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .currentStock(request.getInitialStock() != null ? request.getInitialStock() : 0)
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .build();
        inventory = inventoryRepository.save(inventory);
        product.setInventory(inventory);

        return CatalogMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findOrThrow(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setMrp(request.getMrp());
        product.setDiscountPercent(request.getDiscountPercent());
        product.setSellingPrice(computeSellingPrice(request.getMrp(), request.getDiscountPercent()));
        product.setUnit(request.getUnit());
        product.setWeightValue(request.getWeightValue());
        product.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        if (request.getLowStockThreshold() != null && product.getInventory() != null) {
            product.getInventory().setLowStockThreshold(request.getLowStockThreshold());
            inventoryRepository.save(product.getInventory());
        }

        return CatalogMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = findOrThrow(id);

        // A product that has ever been ordered must be kept for order-history integrity.
        // Disable it instead (PATCH .../status?status=INACTIVE) so it drops out of the storefront.
        if (orderItemRepository.existsByProductId(id)) {
            throw new BadRequestException(
                    "This product has order history and cannot be deleted. Disable it instead to remove it from the storefront.");
        }

        // Clean up dependent inventory history first since Product has no cascading
        // mapping to it (it's an append-only audit log, not part of the aggregate).
        inventoryHistoryRepository.deleteByProductId(id);

        product.getImages().forEach(image -> fileStorageService.delete(image.getImageUrl()));

        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse setStatus(Long id, ProductStatus status) {
        Product product = findOrThrow(id);
        product.setStatus(status);
        return CatalogMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse addImage(Long id, MultipartFile file) {
        Product product = findOrThrow(id);

        String imageUrl = fileStorageService.store(file);
        int nextOrder = product.getImages().size();

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .sortOrder(nextOrder)
                .build();

        product.getImages().add(image);
        return CatalogMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse addImageUrl(Long id, String imageUrl) {
        Product product = findOrThrow(id);

        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new BadRequestException("Image URL is required");
        }

        int nextOrder = product.getImages().size();

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl.trim())
                .sortOrder(nextOrder)
                .build();

        product.getImages().add(image);
        return CatalogMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        Product product = findOrThrow(productId);

        ProductImage image = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Image not found on this product"));

        product.getImages().remove(image);
        fileStorageService.delete(image.getImageUrl());
        productRepository.save(product);
    }

    private BigDecimal computeSellingPrice(BigDecimal mrp, Integer discountPercent) {
        if (discountPercent == null || discountPercent == 0) {
            return mrp.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal discountFactor = BigDecimal.valueOf(100 - discountPercent).divide(BigDecimal.valueOf(100));
        return mrp.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);
    }

    private Sort resolveSort(ProductSortOption sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort) {
            case PRICE_LOW_HIGH -> Sort.by(Sort.Direction.ASC, "sellingPrice");
            case PRICE_HIGH_LOW -> Sort.by(Sort.Direction.DESC, "sellingPrice");
            case DISCOUNT_HIGH_LOW -> Sort.by(Sort.Direction.DESC, "discountPercent");
            case NEWEST, BEST_SELLING -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private Product findOrThrow(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        return productRepository.findById(id).orElseThrow();
    }
}