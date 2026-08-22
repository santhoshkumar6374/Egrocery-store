package com.egrocery.store.ai;

import com.egrocery.store.dto.request.ProductSortOption;
import com.egrocery.store.dto.response.*;
import com.egrocery.store.entity.Category;
import com.egrocery.store.entity.Order;
import com.egrocery.store.entity.Product;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.repository.CategoryRepository;
import com.egrocery.store.repository.OrderRepository;
import com.egrocery.store.repository.ProductRepository;
import com.egrocery.store.repository.specification.ProductSpecification;
import com.egrocery.store.security.CustomUserDetails;
import com.egrocery.store.service.InventoryService;
import com.egrocery.store.service.ProductService;
import com.egrocery.store.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * The grocery assistant's "hands": every method here is exposed to the LLM as a
 * callable tool (see {@link com.egrocery.store.service.impl.AiChatServiceImpl}).
 * The model decides which of these to call and with what arguments; we never let
 * it fabricate prices, stock levels, or order data — everything comes straight
 * from the live database via the same services/repositories the REST API uses.
 *
 * Personal-data tools (spending, order history) deliberately ignore any "user id"
 * the model might try to pass and instead read the authenticated principal from
 * the security context, so the assistant can only ever see the caller's own data.
 */
@Component
@RequiredArgsConstructor
public class GroceryAiTools {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryService inventoryService;
    private final ReportService reportService;
    private final OrderRepository orderRepository;

    @Tool(description = "Search the grocery catalog by keyword, category, brand, price range, and discount. " +
            "Use for questions like 'which rice is cheapest', 'show products under 200', 'which oil has the best discount', " +
            "'what products have offers'. Only returns products currently for sale (never disabled/deleted ones).")
    public List<AiProductView> searchProducts(
            @ToolParam(description = "Free-text keyword to match product name or brand; null for no keyword filter", required = false) String keyword,
            @ToolParam(description = "Category name such as 'Rice', 'Oils', 'Vegetables'; null for all categories", required = false) String categoryName,
            @ToolParam(description = "Brand name; null for any brand", required = false) String brand,
            @ToolParam(description = "Minimum selling price in rupees; null for no minimum", required = false) Double minPrice,
            @ToolParam(description = "Maximum selling price in rupees; null for no maximum", required = false) Double maxPrice,
            @ToolParam(description = "Minimum discount percent; null for no minimum", required = false) Integer minDiscount,
            @ToolParam(description = "If true, only return products currently in stock", required = false) Boolean inStockOnly,
            @ToolParam(description = "One of PRICE_LOW_HIGH, PRICE_HIGH_LOW, DISCOUNT_HIGH_LOW, NEWEST; null defaults to NEWEST", required = false) String sortBy,
            @ToolParam(description = "Max results to return, default 10, max 25", required = false) Integer limit
    ) {
        Long categoryId = resolveCategoryId(categoryName);
        ProductSortOption sort = parseSort(sortBy);
        int size = clamp(limit, 10, 25);

        var page = productService.search(
                keyword,
                categoryId,
                brand,
                minPrice != null ? BigDecimal.valueOf(minPrice) : null,
                maxPrice != null ? BigDecimal.valueOf(maxPrice) : null,
                minDiscount,
                inStockOnly,
                sort,
                0,
                size,
                false // customer-facing: only ACTIVE products
        );

        return page.getContent().stream()
                .map(p -> AiProductView.builder()
                        .productId(p.getId())
                        .name(p.getName())
                        .category(p.getCategoryName())
                        .brand(p.getBrand())
                        .mrp(p.getMrp())
                        .sellingPrice(p.getSellingPrice())
                        .discountPercent(p.getDiscountPercent())
                        .unit(p.getUnit() != null ? p.getUnit().name() : null)
                        .weightValue(p.getWeightValue())
                        .inStock(p.isInStock())
                        .build())
                .toList();
    }

    @Tool(description = "Get full details (including the description) for products matching a name, useful for " +
            "comparing two products or judging which one might be 'healthier' from its description. Returns up to 5 close matches.")
    public List<AiProductView> getProductDetails(
            @ToolParam(description = "The product name to look up, e.g. 'Basmati Rice'") String productName) {

        var spec = ProductSpecification.build(productName, null, null, null, null, null, null,
                com.egrocery.store.entity.enums.ProductStatus.ACTIVE);

        return productRepository.findAll(spec, PageRequest.of(0, 5)).getContent().stream()
                .map(this::toDetailedView)
                .toList();
    }

    @Tool(description = "List all active product categories in the shop.")
    public List<AiCategoryView> getCategories() {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getStatus() == com.egrocery.store.entity.enums.CategoryStatus.ACTIVE)
                .map(c -> AiCategoryView.builder().name(c.getName()).description(c.getDescription()).build())
                .toList();
    }

    @Tool(description = "List products that are currently out of stock.")
    public List<AiProductView> getOutOfStockProducts(
            @ToolParam(description = "Max results, default 10", required = false) Integer limit) {
        int max = clamp(limit, 10, 25);
        return inventoryService.getOutOfStock().stream()
                .limit(max)
                .map(inv -> productRepository.findById(inv.getProductId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(this::toDetailedView)
                .toList();
    }

    @Tool(description = "Get the best-selling products over a recent period — useful for 'which brand is most popular' " +
            "or 'what's trending' questions.")
    public List<AiBestSellerView> getBestSellingProducts(
            @ToolParam(description = "How many past days to look at, default 30", required = false) Integer days,
            @ToolParam(description = "Max results, default 10", required = false) Integer limit) {

        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(days != null && days > 0 ? days : 30);
        int max = clamp(limit, 10, 25);

        return reportService.getBestSellingProducts(from, to, max).stream()
                .map(b -> AiBestSellerView.builder()
                        .productName(b.getProductName())
                        .quantitySold(b.getQuantitySold())
                        .revenue(b.getRevenue())
                        .build())
                .toList();
    }

    @Tool(description = "Get how much the CURRENTLY LOGGED-IN customer has spent this calendar month. " +
            "Always reflects the authenticated caller — there is no way to look up another customer's spending with this tool.")
    public AiSpendingView getMySpendingThisMonth() {
        Long userId = currentCustomerId();

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();

        List<Order> monthOrders = orderRepository.findByPlacedAtBetweenAndStatusNot(
                start, start.plusMonths(1), com.egrocery.store.entity.enums.OrderStatus.CANCELLED);

        long myOrderCount = monthOrders.stream().filter(o -> o.getUser().getId().equals(userId)).count();
        BigDecimal mySpend = monthOrders.stream()
                .filter(o -> o.getUser().getId().equals(userId))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AiSpendingView.builder()
                .totalSpentThisMonth(mySpend)
                .orderCountThisMonth(myOrderCount)
                .build();
    }

    @Tool(description = "Get the CURRENTLY LOGGED-IN customer's recent order history, including items purchased. " +
            "Use for 'show my last order' or 'recommend based on my previous purchases'. " +
            "Always reflects the authenticated caller — there is no way to look up another customer's orders with this tool.")
    public List<AiOrderView> getMyOrderHistory(
            @ToolParam(description = "Max number of recent orders to return, default 5", required = false) Integer limit) {
        Long userId = currentCustomerId();
        int max = clamp(limit, 5, 15);

        var page = orderRepository.findByUserId(userId,
                PageRequest.of(0, max, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "placedAt")));

        return page.getContent().stream()
                .map(o -> AiOrderView.builder()
                        .orderNumber(o.getOrderNumber())
                        .status(o.getStatus().name())
                        .placedAt(o.getPlacedAt())
                        .totalAmount(o.getTotalAmount())
                        .items(o.getItems().stream()
                                .map(i -> AiOrderItemView.builder()
                                        .productName(i.getProductName())
                                        .quantity(i.getQuantity())
                                        .unitPrice(i.getUnitPrice())
                                        .build())
                                .toList())
                        .build())
                .toList();
    }

    // ---------- helpers ----------

    private AiProductView toDetailedView(Product p) {
        var inv = p.getInventory();
        return AiProductView.builder()
                .productId(p.getId())
                .name(p.getName())
                .category(p.getCategory().getName())
                .brand(p.getBrand())
                .mrp(p.getMrp())
                .sellingPrice(p.getSellingPrice())
                .discountPercent(p.getDiscountPercent())
                .unit(p.getUnit() != null ? p.getUnit().name() : null)
                .weightValue(p.getWeightValue())
                .inStock(inv != null && inv.getCurrentStock() > 0)
                .stockQuantity(inv != null ? inv.getCurrentStock() : 0)
                .description(p.getDescription())
                .build();
    }

    private Long resolveCategoryId(String categoryName) {
        if (categoryName == null || categoryName.isBlank()) {
            return null;
        }
        return categoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName.trim())
                        || c.getName().toLowerCase().contains(categoryName.trim().toLowerCase()))
                .map(Category::getId)
                .findFirst()
                .orElse(null); // no match -> search falls back to unfiltered-by-category
    }

    private ProductSortOption parseSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return ProductSortOption.NEWEST;
        }
        try {
            return ProductSortOption.valueOf(sortBy.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProductSortOption.NEWEST;
        }
    }

    private int clamp(Integer value, int defaultValue, int max) {
        if (value == null || value <= 0) {
            return defaultValue;
        }
        return Math.min(value, max);
    }

    private Long currentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new BadRequestException("This action requires a logged-in customer");
        }
        return principal.getId();
    }
}