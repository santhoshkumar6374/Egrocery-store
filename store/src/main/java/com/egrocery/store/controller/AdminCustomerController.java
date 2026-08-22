package com.egrocery.store.controller;

import com.egrocery.store.dto.response.*;
import com.egrocery.store.entity.enums.UserStatus;
import com.egrocery.store.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Customers (Admin)", description = "View, search, block/activate, and manage customers")
public class AdminCustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CustomerSummaryResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(customerService.searchCustomers(keyword, status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerDetail(id)));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderListItemResponse>>> orders(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerOrders(id, page, size)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> setStatus(@PathVariable Long id,
                                                                         @RequestParam UserStatus status) {
        CustomerDetailResponse updated = customerService.setCustomerStatus(id, status);
        String message = status == UserStatus.BLOCKED ? "Customer blocked" : "Customer activated";
        return ResponseEntity.ok(ApiResponse.success(message, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }
}