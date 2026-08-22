package com.egrocery.store.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCategoryView {

    private String name;
    private String description;
}