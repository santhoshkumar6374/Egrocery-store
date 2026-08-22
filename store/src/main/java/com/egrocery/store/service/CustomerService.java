package com.egrocery.store.service;

import com.egrocery.store.dto.response.CustomerDetailResponse;
import com.egrocery.store.dto.response.CustomerSummaryResponse;
import com.egrocery.store.dto.response.OrderListItemResponse;
import com.egrocery.store.dto.response.PageResponse;
import com.egrocery.store.entity.enums.UserStatus;

/**
 * Admin-facing customer management (view/search/block/activate/delete). This is
 * distinct from UserService, which handles a logged-in user's own profile.
 */
public interface CustomerService {

    PageResponse<CustomerSummaryResponse> searchCustomers(String keyword, UserStatus status, int page, int size);

    CustomerDetailResponse getCustomerDetail(Long customerId);

    CustomerDetailResponse setCustomerStatus(Long customerId, UserStatus status);

    PageResponse<OrderListItemResponse> getCustomerOrders(Long customerId, int page, int size);

    void deleteCustomer(Long customerId);
}