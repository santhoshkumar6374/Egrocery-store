package com.egrocery.store.controller;

import com.egrocery.store.dto.request.StockUpdateRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.InventoryHistoryResponse;
import com.egrocery.store.dto.response.InventoryResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.service.InventoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory (Admin)", description = "Stock levels, low/out-of-stock alerts, and stock movement history")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAll(page, size)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> lowStock() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStock()));
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> outOfStock() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getOutOfStock()));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getByProductId(productId)));
    }

    @PutMapping("/{productId}/stock")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateStock(@PathVariable Long productId,
                                                                      @Valid @RequestBody StockUpdateRequest request) {
        InventoryResponse updated = inventoryService.updateStock(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Stock updated", updated));
    }

    @GetMapping("/{productId}/history")
    public ResponseEntity<ApiResponse<PageResponse<InventoryHistoryResponse>>> history(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getHistory(productId, page, size)));
    }
}