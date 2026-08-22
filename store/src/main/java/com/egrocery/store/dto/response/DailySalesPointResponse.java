package com.egrocery.store.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySalesPointResponse {

    private LocalDate date;
    private long orders;
    private BigDecimal revenue;
}