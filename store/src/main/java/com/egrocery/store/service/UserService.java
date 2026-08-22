package com.egrocery.store.service;

import com.egrocery.store.dto.request.AddressRequest;
import com.egrocery.store.dto.request.ChangePasswordRequest;
import com.egrocery.store.dto.request.UpdateProfileRequest;
import com.egrocery.store.dto.response.AddressResponse;
import com.egrocery.store.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getCurrentProfile(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    List<AddressResponse> getAddresses(Long userId);

    AddressResponse addAddress(Long userId, AddressRequest request);

    void deleteAddress(Long userId, Long addressId);
}