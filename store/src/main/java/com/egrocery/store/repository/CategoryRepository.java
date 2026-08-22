package com.egrocery.store.repository;

import com.egrocery.store.entity.Category;
import com.egrocery.store.entity.enums.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByStatus(CategoryStatus status);

    boolean existsByNameIgnoreCase(String name);

    Optional<Category> findByIdAndStatus(Long id, CategoryStatus status);
}