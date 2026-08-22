import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import { adminOrderApi } from '../../../api/adminOrderApi';
import OrderStatusChip from '../../../components/common/OrderStatusChip';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

const STATUSES = ['PLACED', 'ACCEPTED', 'PACKED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const TERMINAL_STATUSES = ['DELIVERED', 'CANCELLED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrder = () => {
    setLoading(true);
    adminOrderApi
      .getById(id)
      .then(({ data }) => {
        setOrder(data.data);
        setNextStatus(data.data.status);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this order')))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await adminOrderApi.updateStatus(id, nextStatus);
      showToast('Order status updated');
      loadOrder();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update status'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return <Alert severity="error">{error || 'Order not found'}</Alert>;
  }

  const isTerminal = TERMINAL_STATUSES.includes(order.status);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/orders" underline="hover" color="text.secondary">
          Orders
        </Link>
        <Typography color="text.primary">{order.orderNumber}</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            {order.orderNumber}
          </Typography>
          <Typography color="text.secondary">
            {order.customerName} · {order.customerEmail}
          </Typography>
        </Box>
        <OrderStatusChip status={order.status} size="medium" />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Update Status
        </Typography>
        {isTerminal ? (
          <Alert severity="info">This order is in a terminal state and can no longer be updated.</Alert>
        ) : (
          <Stack direction="row" spacing={2}>
            <TextField select size="small" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} sx={{ minWidth: 220 }}>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleUpdateStatus} disabled={updating || nextStatus === order.status}>
              {updating ? 'Updating…' : 'Update'}
            </Button>
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {order.deliveryType === 'HOME_DELIVERY' ? 'Delivering to' : 'Pickup'}
        </Typography>
        {order.deliveryType === 'HOME_DELIVERY' ? (
          <>
            <Typography>{order.addressLine}</Typography>
            <Typography color="text.secondary">
              {order.city} {order.pincode}
            </Typography>
            {order.distanceKm != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {order.distanceKm.toFixed(1)} km away
              </Typography>
            )}
          </>
        ) : (
          <Typography color="text.secondary">Customer will collect this order from the shop.</Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Items
        </Typography>
        <Stack spacing={1.5}>
          {order.items.map((item, idx) => (
            <Stack key={idx} direction="row" justifyContent="space-between">
              <Typography color="text.secondary">
                {item.productName} × {item.quantity}
              </Typography>
              <Typography>{formatCurrency(item.subtotal)}</Typography>
            </Stack>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Items total</Typography>
            <Typography>{formatCurrency(order.itemsTotal)}</Typography>
          </Stack>
          {order.discountAmount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Discount {order.couponCode ? `(${order.couponCode})` : ''}</Typography>
              <Typography color="secondary.main">-{formatCurrency(order.discountAmount)}</Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Delivery</Typography>
            <Typography>{order.deliveryCharge > 0 ? formatCurrency(order.deliveryCharge) : 'Free'}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{formatCurrency(order.totalAmount)}</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Payment
        </Typography>
        <Typography color="text.secondary">
          {order.paymentMethod?.replace(/_/g, ' ')} · {order.paymentStatus} · Placed {formatDateTime(order.placedAt)}
        </Typography>
      </Paper>
    </Box>
  );
}