package com.egrocery.store.service.impl;

import com.egrocery.store.dto.response.CustomerDetailResponse;
import com.egrocery.store.dto.response.CustomerSummaryResponse;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.User;
import com.egrocery.store.entity.enums.RoleName;
import com.egrocery.store.entity.enums.UserStatus;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.exception.ResourceNotFoundException;
import com.egrocery.store.repository.*;
import com.egrocery.store.repository.specification.UserSpecification;
import com.egrocery.store.service.CustomerService;
import com.egrocery.store.util.OrderMapper;
import com.egrocery.store.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistItemRepository wishlistItemRepository;

    @Override
    public PageResponse<CustomerSummaryResponse> searchCustomers(String keyword, UserStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt"));

        var result = userRepository.findAll(
                UserSpecification.build(keyword, status, RoleName.CUSTOMER), pageable);

        return PageResponse.from(result.map(this::toSummary));
    }

    @Override
    public CustomerDetailResponse getCustomerDetail(Long customerId) {
        User customer = findCustomerOrThrow(customerId);

        return CustomerDetailResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .mobile(customer.getMobile())
                .status(customer.getStatus())
                .addresses(addressRepository.findByUserId(customerId).stream()
                        .map(UserMapper::toAddressResponse)
                        .toList())
                .totalOrders(orderRepository.countValidOrdersByUserId(customerId))
                .totalSpent(orderRepository.sumSpentByUserId(customerId))
                .joinedAt(customer.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CustomerDetailResponse setCustomerStatus(Long customerId, UserStatus status) {
        User customer = findCustomerOrThrow(customerId);
        customer.setStatus(status);
        userRepository.save(customer);
        return getCustomerDetail(customerId);
    }

    @Override
    public PageResponse<OrderListItemResponse> getCustomerOrders(Long customerId, int page, int size) {
        findCustomerOrThrow(customerId); // 404s cleanly if the id isn't a customer at all
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "placedAt"));
        return PageResponse.from(orderRepository.findByUserId(customerId, pageable).map(OrderMapper::toListItem));
    }

    @Override
    @Transactional
    public void deleteCustomer(Long customerId) {
        User customer = findCustomerOrThrow(customerId);

        if (orderRepository.existsByUserId(customerId)) {
            throw new BadRequestException(
                    "This customer has order history and cannot be deleted. Block them instead to prevent further orders.");
        }

        cartRepository.findByUserId(customerId).ifPresent(cartRepository::delete);
        refreshTokenRepository.deleteByUserId(customerId);
        reviewRepository.deleteByUserId(customerId);
        wishlistItemRepository.deleteByUserId(customerId);

        userRepository.delete(customer); // addresses cascade-delete with the user
    }

    private CustomerSummaryResponse toSummary(User user) {
        return CustomerSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .status(user.getStatus())
                .totalOrders(orderRepository.countValidOrdersByUserId(user.getId()))
                .totalSpent(orderRepository.sumSpentByUserId(user.getId()))
                .joinedAt(user.getCreatedAt())
                .build();
    }

    private User findCustomerOrThrow(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        boolean isCustomer = user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.CUSTOMER);
        if (!isCustomer) {
            throw new ResourceNotFoundException("Customer not found");
        }
        return user;
    }
}