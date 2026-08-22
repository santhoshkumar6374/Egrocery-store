package com.egrocery.store.service.impl;

import com.egrocery.store.dto.request.CategoryRequest;
import com.egrocery.store.dto.response.CategoryResponse;
import com.egrocery.store.entity.Category;
import com.egrocery.store.entity.enums.CategoryStatus;
import com.egrocery.store.exception.DuplicateResourceException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.CategoryRepository;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.specification.ProductSpecification;
import com.egrocery.store.service.CategoryService;
import com.egrocery.store.util.CatalogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CategoryResponse> getAllForAdmin() {
        return categoryRepository.findAll().stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    public List<CategoryResponse> getActiveForCustomer() {
        return categoryRepository.findByStatus(CategoryStatus.ACTIVE).stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    public CategoryResponse getByIdForAdmin(Long id) {
        return toResponseWithCount(findOrThrow(id));
    }

    @Override
    public CategoryResponse getActiveById(Long id) {
        Category category = categoryRepository.findByIdAndStatus(id, CategoryStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toResponseWithCount(category);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("A category with this name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(request.getStatus() != null ? request.getStatus() : CategoryStatus.ACTIVE)
                .build();

        return toResponseWithCount(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findOrThrow(id);

        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("A category with this name already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        return toResponseWithCount(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = findOrThrow(id);

        long productCount = productRepository.count(
                ProductSpecification.build(null, category.getId(), null, null, null, null, null, null));
        if (productCount > 0) {
            throw new com.egrocery.store.exception.BadRequestException(
                    "Cannot delete a category that still has products. Reassign or delete its products first.");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse toResponseWithCount(Category category) {
        long count = productRepository.count(
                ProductSpecification.build(null, category.getId(), null, null, null, null, null, null));
        return CatalogMapper.toCategoryResponse(category, count);
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
}