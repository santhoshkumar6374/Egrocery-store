package com.egrocery.store.dto.request;

import com.egrocery.store.entity.enums.DeliveryType;
import com.egrocery.store.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotNull(message = "Delivery type is required")
    private DeliveryType deliveryType;

    /** Required when deliveryType is HOME_DELIVERY, ignored for PACK_MY_ORDER. */
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}