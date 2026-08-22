package com.egrocery.store.controller;

import com.egrocery.store.dto.request.UpdateOrderStatusRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.OrderResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.enums.OrderStatus;
import com.egrocery.store.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Orders (Admin)", description = "View and manage every order's status")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderListItemResponse>>> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(status, page, size)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderForAdmin(orderId)));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable Long orderId,
                                                                   @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse updated = orderService.updateStatus(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", updated));
    }
}