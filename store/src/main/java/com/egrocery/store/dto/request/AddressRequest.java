package com.egrocery.store.dto.request;

import com.egrocery.store.entity.enums.AddressLabel;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {

    private AddressLabel label;

    @NotBlank(message = "Address line is required")
    private String addressLine;

    private String city;
    private String state;
    private String pincode;
    private Boolean isDefault;
}
