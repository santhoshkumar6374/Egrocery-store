package com.egrocery.store.repository.specification;

import com.egrocery.store.entity.Product;
import com.egrocery.store.entity.enums.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds a dynamic Specification<Product> from optional search/filter parameters.
 * Any parameter left null is simply skipped.
 */
public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> build(String keyword,
                                               Long categoryId,
                                               String brand,
                                               BigDecimal minPrice,
                                               BigDecimal maxPrice,
                                               Integer minDiscount,
                                               Boolean inStockOnly,
                                               ProductStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), like);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), like);
                Predicate categoryMatch = cb.like(cb.lower(root.join("category").get("name")), like);
                predicates.add(cb.or(nameMatch, brandMatch, categoryMatch));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (brand != null && !brand.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("sellingPrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("sellingPrice"), maxPrice));
            }

            if (minDiscount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("discountPercent"), minDiscount));
            }

            if (Boolean.TRUE.equals(inStockOnly)) {
                predicates.add(cb.greaterThan(root.join("inventory").get("currentStock"), 0));
            }

            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}