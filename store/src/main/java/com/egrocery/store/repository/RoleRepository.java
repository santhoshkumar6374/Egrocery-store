package com.egrocery.store.repository;

import com.egrocery.store.entity.Role;
import com.egrocery.store.entity.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}