package com.egrocery.store.util;

import com.egrocery.store.dto.response.OrderItemResponse;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.OrderResponse;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.OrderItem;

import java.util.List;

public final class OrderMapper {

    private OrderMapper() {
    }

    public static OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }

    public static OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderMapper::toItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .deliveryType(order.getDeliveryType())
                .customerId(order.getUser().getId())
                .customerName(order.getUser().getName())
                .customerEmail(order.getUser().getEmail())
                .addressLine(order.getAddressLine())
                .city(order.getCity())
                .state(order.getState())
                .pincode(order.getPincode())
                .distanceKm(order.getDistanceKm())
                .estimatedDeliveryMinutes(order.getEstimatedDeliveryMinutes())
                .itemsTotal(order.getItemsTotal())
                .deliveryCharge(order.getDeliveryCharge())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .items(items)
                .placedAt(order.getPlacedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public static OrderListItemResponse toListItem(Order order) {
        int itemCount = order.getItems().stream().mapToInt(OrderItem::getQuantity).sum();

        return OrderListItemResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .deliveryType(order.getDeliveryType())
                .itemCount(itemCount)
                .totalAmount(order.getTotalAmount())
                .placedAt(order.getPlacedAt())
                .build();
    }
}