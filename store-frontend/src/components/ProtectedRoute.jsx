import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

/**
 * Guards a route subtree. Usage:
 *   <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
 *     <Route path="/account" element={<AccountPage />} />
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length) {
    const roles = user?.roles ?? [];
    const hasAccess = allowedRoles.some((role) => roles.includes(role));
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}