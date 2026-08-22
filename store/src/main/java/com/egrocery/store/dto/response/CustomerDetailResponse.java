package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.UserStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDetailResponse {

    private Long id;
    private String name;
    private String email;
    private String mobile;
    private UserStatus status;
    private List<AddressResponse> addresses;
    private long totalOrders;
    private BigDecimal totalSpent;
    private LocalDateTime joinedAt;
}