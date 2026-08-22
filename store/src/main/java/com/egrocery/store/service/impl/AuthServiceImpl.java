package com.egrocery.store.service.impl;

import com.egrocery.store.config.JwtProperties;
import com.egrocery.store.dto.request.LoginRequest;
import com.egrocery.store.dto.request.RegisterRequest;
import com.egrocery.store.dto.response.AuthResponse;
import com.egrocery.store.entity.RefreshToken;
import com.egrocery.store.entity.Role;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.RoleName;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.DuplicateResourceException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.RefreshTokenRepository;
import com.egrocery.store.repository.RoleRepository;
import com.egrocery.store.repository.UserRepository;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.security.JwtUtil;
import com.egrocery.store.service.AuthService;
import com.egrocery.store.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role is not seeded in the database"));

        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobile(request.getMobile())
                .roles(roles)
                .build();

        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiryDate().isBefore(Instant.now())) {
            throw new BadRequestException("Refresh token expired or revoked, please log in again");
        }

        User user = stored.getUser();

        // Rotate: revoke the used token and issue a fresh pair
        refreshTokenRepository.delete(stored);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse buildAuthResponse(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshTokenValue = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .user(UserMapper.toUserResponse(user))
                .build();
    }

    private String createRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()))
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }
}