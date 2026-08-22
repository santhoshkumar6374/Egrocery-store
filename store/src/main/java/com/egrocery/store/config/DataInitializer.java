package com.egrocery.store.config;

import com.egrocery.store.entity.Role;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.RoleName;
import com.egrocery.store.repository.RoleRepository;
import com.egrocery.store.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Seeds the two fixed roles (ADMIN, CUSTOMER) and a default shop-owner account
 * on first startup, since this app supports exactly one shop and one admin.
 * Override the default admin credentials via ADMIN_EMAIL / ADMIN_PASSWORD env vars
 * in production.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@egrocery.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMIN).build()));

        roleRepository.findByName(RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.CUSTOMER).build()));

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("Shop Owner")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .mobile("9999999999")
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(admin);
            log.info("Seeded default admin account: {}", adminEmail);
        }
    }
}