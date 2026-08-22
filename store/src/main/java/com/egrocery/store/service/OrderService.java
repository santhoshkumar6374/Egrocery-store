package com.egrocery.store.service;

import com.egrocery.store.dto.request.CreateOrderRequest;
import com.egrocery.store.dto.request.UpdateOrderStatusRequest;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.OrderResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.enums.OrderStatus;

public interface OrderService {

    OrderResponse placeOrder(Long userId, CreateOrderRequest request);

    PageResponse<OrderListItemResponse> getMyOrders(Long userId, int page, int size);

    OrderResponse getMyOrder(Long userId, Long orderId);

    OrderResponse cancelMyOrder(Long userId, Long orderId);

    PageResponse<OrderListItemResponse> getAllOrders(OrderStatus status, int page, int size);

    OrderResponse getOrderForAdmin(Long orderId);

    OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request);
}