import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '../components/layout/StorefrontLayout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import ComingSoon from '../components/common/ComingSoon';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminCategoriesPage from '../pages/admin/categories/AdminCategoriesPage';
import AdminProductsPage from '../pages/admin/products/AdminProductsPage';
import AdminProductFormPage from '../pages/admin/products/AdminProductFormPage';
import AdminInventoryPage from '../pages/admin/inventory/AdminInventoryPage';
import AdminCustomersPage from '../pages/admin/customers/AdminCustomersPage';
import AdminCustomerDetailPage from '../pages/admin/customers/AdminCustomerDetailPage';
import AdminOrdersPage from '../pages/admin/orders/AdminOrdersPage';
import AdminOrderDetailPage from '../pages/admin/orders/AdminOrderDetailPage';
import AdminPaymentsPage from '../pages/admin/payments/AdminPaymentsPage';
import AdminCouponsPage from '../pages/admin/coupons/AdminCouponsPage';
import AdminDeliverySettingsPage from '../pages/admin/delivery/AdminDeliverySettingsPage';
import AdminReportsPage from '../pages/admin/reports/AdminReportsPage';
import ProductsPage from '../pages/customer/ProductsPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrdersPage from '../pages/customer/OrdersPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import WishlistPage from '../pages/customer/WishlistPage';
import AssistantPage from '../pages/customer/AssistantPage';
import AdminReviewsPage from '../pages/admin/reviews/AdminReviewsPage';
import ProfilePage from '../pages/customer/ProfilePage';
import { ROLES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public + customer storefront (shared header/footer) */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
           <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile" element={<ComingSoon title="My Profile" />} />

          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>
      </Route>

      {/* Auth pages — distinct split-screen frame */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin console */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/:id" element={<AdminProductFormPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/delivery-settings" element={<AdminDeliverySettingsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}