package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.StockUpdateRequest;
import com.egrocery.store.dto.response.InventoryHistoryResponse;
import com.egrocery.store.dto.response.InventoryResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.Inventory;
import com.egrocery.store.entity.InventoryHistory;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.InventoryHistoryRepository;
import com.egrocery.store.repository.InventoryRepository;
import com.egrocery.store.service.InventoryService;
import com.egrocery.store.util.CatalogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    @Transactional(readOnly = true)
    @Override
    public PageResponse<InventoryResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return PageResponse.from(inventoryRepository.findAll(pageable).map(CatalogMapper::toInventoryResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getByProductId(Long productId) {
        return CatalogMapper.toInventoryResponse(findOrThrow(productId));
    }

    @Override
    @Transactional
    public InventoryResponse updateStock(Long productId, StockUpdateRequest request) {
        Inventory inventory = findOrThrow(productId);
        int previousStock = inventory.getCurrentStock();
        int newStock;

        switch (request.getChangeType()) {
            case STOCK_IN, RETURN -> newStock = previousStock + request.getQuantity();
            case STOCK_OUT, SALE -> {
                if (request.getQuantity() > previousStock) {
                    throw new BadRequestException("Cannot remove more stock than is currently available");
                }
                newStock = previousStock - request.getQuantity();
            }
            // Treated as a correction to an exact counted quantity (e.g. after a stock take).
            case ADJUSTMENT -> newStock = request.getQuantity();
            default -> throw new BadRequestException("Unsupported stock change type");
        }

        inventory.setCurrentStock(newStock);
        inventoryRepository.save(inventory);

        InventoryHistory history = InventoryHistory.builder()
                .product(inventory.getProduct())
                .changeType(request.getChangeType())
                .quantityChanged(newStock - previousStock)
                .previousStock(previousStock)
                .newStock(newStock)
                .reason(request.getReason())
                .build();
        inventoryHistoryRepository.save(history);

        return CatalogMapper.toInventoryResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStock() {
        return inventoryRepository.findLowStock().stream()
                .map(CatalogMapper::toInventoryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getOutOfStock() {
        return inventoryRepository.findOutOfStock().stream()
                .map(CatalogMapper::toInventoryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryHistoryResponse> getHistory(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                inventoryHistoryRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                        .map(CatalogMapper::toHistoryResponse)
        );
    }

    private Inventory findOrThrow(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for this product"));
    }
}