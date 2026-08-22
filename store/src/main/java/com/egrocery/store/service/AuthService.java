package com.egrocery.store.service;

import com.egrocery.store.dto.request.LoginRequest;
import com.egrocery.store.dto.request.RegisterRequest;
import com.egrocery.store.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(String refreshToken);
}