package com.egrocery.store.service;

import com.egrocery.store.dto.request.CategoryRequest;
import com.egrocery.store.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllForAdmin();

    List<CategoryResponse> getActiveForCustomer();

    CategoryResponse getByIdForAdmin(Long id);

    CategoryResponse getActiveById(Long id);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}