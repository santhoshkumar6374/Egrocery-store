package com.egrocery.store.repository;

import com.egrocery.store.entity.DeliveryCharge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryChargeRepository extends JpaRepository<DeliveryCharge, Long> {

    Optional<DeliveryCharge> findFirstByOrderByIdAsc();
}