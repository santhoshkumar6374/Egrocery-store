package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.CategoryStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private CategoryStatus status;
    private long productCount;
}