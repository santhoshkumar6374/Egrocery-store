package com.egrocery.store.controller;

import com.egrocery.store.dto.request.CreateOrderRequest;
import com.egrocery.store.dto.response.ApiResponse;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.OrderResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
@Tag(name = "Orders (Customer)", description = "Checkout, order history, and order tracking")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@AuthenticationPrincipal CustomUserDetails principal,
                                                                 @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.placeOrder(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderListItemResponse>>> myOrders(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(principal.getId(), page, size)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getMyOrder(@AuthenticationPrincipal CustomUserDetails principal,
                                                                 @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrder(principal.getId(), orderId)));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@AuthenticationPrincipal CustomUserDetails principal,
                                                             @PathVariable Long orderId) {
        OrderResponse order = orderService.cancelMyOrder(principal.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", order));
    }
}