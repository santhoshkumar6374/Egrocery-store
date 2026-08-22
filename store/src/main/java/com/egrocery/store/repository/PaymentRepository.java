package com.egrocery.store.repository;

import com.egrocery.store.entity.Payment;
import com.egrocery.store.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}