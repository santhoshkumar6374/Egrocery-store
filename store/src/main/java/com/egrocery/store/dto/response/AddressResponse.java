package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.AddressLabel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private AddressLabel label;
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private boolean isDefault;
}
