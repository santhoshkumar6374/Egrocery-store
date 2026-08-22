package com.egrocery.store.dto.response;

import com.egrocery.store.entity.enums.UserStatus;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String mobile;
    private UserStatus status;
    private Set<String> roles;
}