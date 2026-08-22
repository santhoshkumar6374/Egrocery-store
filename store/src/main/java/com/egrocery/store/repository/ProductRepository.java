package com.egrocery.store.repository;

import com.egrocery.store.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query("""
    SELECT DISTINCT p
    FROM Product p
    LEFT JOIN FETCH p.images
    LEFT JOIN FETCH p.category
    WHERE p.id = :id
""")
    Optional<Product> findByIdWithImages(@Param("id") Long id);
}