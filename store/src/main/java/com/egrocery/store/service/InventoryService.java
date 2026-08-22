package com.egrocery.store.service;

import com.egrocery.store.dto.request.StockUpdateRequest;
import com.egrocery.store.dto.response.InventoryHistoryResponse;
import com.egrocery.store.dto.response.InventoryResponse;
import com.egrocery.store.dto.response.PageResponse;

import java.util.List;

public interface InventoryService {

    PageResponse<InventoryResponse> getAll(int page, int size);

    InventoryResponse getByProductId(Long productId);

    InventoryResponse updateStock(Long productId, StockUpdateRequest request);

    List<InventoryResponse> getLowStock();

    List<InventoryResponse> getOutOfStock();

    PageResponse<InventoryHistoryResponse> getHistory(Long productId, int page, int size);
}