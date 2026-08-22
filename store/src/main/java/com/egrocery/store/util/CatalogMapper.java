package com.egrocery.store.util;

import com.egrocery.store.dto.response.*;
import com.egrocery.store.entity.Category;
import com.egrocery.store.entity.Inventory;
import com.egrocery.store.entity.InventoryHistory;
import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.enums.StockStatus;

import java.util.List;

public final class CatalogMapper {

    private CatalogMapper() {
    }

    public static CategoryResponse toCategoryResponse(Category category, long productCount) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .status(category.getStatus())
                .productCount(productCount)
                .build();
    }

    public static StockStatus resolveStockStatus(Inventory inventory) {
        if (inventory == null || inventory.getCurrentStock() <= 0) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (inventory.getCurrentStock() <= inventory.getLowStockThreshold()) {
            return StockStatus.LOW_STOCK;
        }
        return StockStatus.IN_STOCK;
    }

    public static ProductResponse toProductResponse(Product product) {
        Inventory inventory = product.getInventory();

        List<ProductImageResponse> images = product.getImages().stream()
                .map(image -> ProductImageResponse.builder()
                        .id(image.getId())
                        .imageUrl(image.getImageUrl())
                        .build())
                .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .category(CategorySummaryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .build())
                .brand(product.getBrand())
                .mrp(product.getMrp())
                .sellingPrice(product.getSellingPrice())
                .discountPercent(product.getDiscountPercent())
                .unit(product.getUnit())
                .weightValue(product.getWeightValue())
                .description(product.getDescription())
                .status(product.getStatus())
                .images(images)
                .currentStock(inventory != null ? inventory.getCurrentStock() : 0)
                .lowStockThreshold(inventory != null ? inventory.getLowStockThreshold() : 0)
                .stockStatus(resolveStockStatus(inventory))
                .build();
    }

    public static ProductListItemResponse toProductListItem(Product product) {
        Inventory inventory = product.getInventory();
        String primaryImage = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();

        return ProductListItemResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .categoryName(product.getCategory().getName())
                .brand(product.getBrand())
                .mrp(product.getMrp())
                .sellingPrice(product.getSellingPrice())
                .discountPercent(product.getDiscountPercent())
                .unit(product.getUnit())
                .weightValue(product.getWeightValue())
                .primaryImageUrl(primaryImage)
                .inStock(inventory != null && inventory.getCurrentStock() > 0)
                .status(product.getStatus())
                .build();
    }

    public static InventoryResponse toInventoryResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getName())
                .currentStock(inventory.getCurrentStock())
                .lowStockThreshold(inventory.getLowStockThreshold())
                .stockStatus(resolveStockStatus(inventory))
                .build();
    }

    public static InventoryHistoryResponse toHistoryResponse(InventoryHistory history) {
        return InventoryHistoryResponse.builder()
                .id(history.getId())
                .productName(history.getProduct().getName())
                .changeType(history.getChangeType())
                .quantityChanged(history.getQuantityChanged())
                .previousStock(history.getPreviousStock())
                .newStock(history.getNewStock())
                .reason(history.getReason())
                .createdAt(history.getCreatedAt())
                .build();
    }
}