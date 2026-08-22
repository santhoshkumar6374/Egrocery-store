import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Box,
  Divider,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { orderApi } from '../../api/orderApi';
import OrderStatusChip from '../../components/common/OrderStatusChip';
import OrderStatusStepper from '../../components/customer/OrderStatusStepper';
import RazorpayPayButton from '../../components/customer/RazorpayPayButton';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../hooks/useToast';

const CANCELLABLE_STATUSES = ['PLACED', 'ACCEPTED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = () => {
    setLoading(true);
    orderApi
      .getById(id)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this order')))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderApi.cancel(id);
      showToast('Order cancelled');
      setCancelDialogOpen(false);
      loadOrder();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not cancel this order'), 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {error || 'Order not found'}
        </Typography>
        <Button component={RouterLink} to="/orders" variant="contained">
          Back to Orders
        </Button>
      </Container>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {order.orderNumber}
        </Typography>
        <OrderStatusChip status={order.status} size="medium" />
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Placed {formatDateTime(order.placedAt)}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <OrderStatusStepper status={order.status} deliveryType={order.deliveryType} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {order.deliveryType === 'HOME_DELIVERY' ? 'Delivering to' : 'Pickup details'}
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
                {order.estimatedDeliveryMinutes ? ` · ~${order.estimatedDeliveryMinutes} min estimated` : ''}
              </Typography>
            )}
          </>
        ) : (
          <Typography color="text.secondary">
            Collect this order from the shop counter
            {order.estimatedDeliveryMinutes ? ` — ready in ~${order.estimatedDeliveryMinutes} min` : ''}.
          </Typography>
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
              <Typography color="text.secondary">
                Discount {order.couponCode ? `(${order.couponCode})` : ''}
              </Typography>
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

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Payment
        </Typography>
        <Typography color="text.secondary" sx={{ mb: order.paymentStatus === 'PENDING' && order.paymentMethod !== 'CASH_ON_DELIVERY' ? 2 : 0 }}>
          {order.paymentMethod?.replace(/_/g, ' ')} · {order.paymentStatus}
        </Typography>
        {order.paymentStatus === 'PENDING' && order.paymentMethod !== 'CASH_ON_DELIVERY' && (
          <RazorpayPayButton orderId={order.id} orderNumber={order.orderNumber} onSuccess={loadOrder} />
        )}
      </Paper>

      {canCancel && (
        <Button color="error" variant="outlined" onClick={() => setCancelDialogOpen(true)}>
          Cancel Order
        </Button>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel this order?</DialogTitle>
        <DialogContent>
          <DialogContentText>This can't be undone. Items will be returned to stock.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Order</Button>
          <Button color="error" variant="contained" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}