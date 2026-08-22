package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.AddressRequest;
import com.egrocery.store.dto.request.ChangePasswordRequest;
import com.egrocery.store.dto.request.UpdateProfileRequest;
import com.egrocery.store.dto.response.AddressResponse;
import com.egrocery.store.dto.response.UserResponse;
import com.egrocery.store.entity.Address;
import com.egrocery.store.entity.User;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.AddressRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.service.UserService;
import com.egrocery.store.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getCurrentProfile(Long userId) {
        return UserMapper.toUserResponse(getUserOrThrow(userId));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserOrThrow(userId);
        user.setName(request.getName());
        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            user.setMobile(request.getMobile());
        }
        return UserMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserOrThrow(userId);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(UserMapper::toAddressResponse)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = getUserOrThrow(userId);

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        return UserMapper.toAddressResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this address");
        }

        addressRepository.delete(address);
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}