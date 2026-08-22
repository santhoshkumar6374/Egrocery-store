import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stack,
  IconButton,
  Button,
  Divider,
  Alert,
  Paper,
  Grid,
  TextField,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { resolveImageUrl, formatCurrency } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/apiError';

export default function CartPage() {
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon, loading } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [busyItemId, setBusyItemId] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) return;
    setBusyItemId(item.id);
    try {
      await updateItem(item.id, nextQuantity);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update quantity'), 'error');
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (item) => {
    setBusyItemId(item.id);
    try {
      await removeItem(item.id);
      showToast(`Removed "${item.productName}" from your cart`);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not remove that item'), 'error');
    } finally {
      setBusyItemId(null);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError('');
    try {
      await applyCoupon(couponInput.trim());
      showToast('Coupon applied');
      setCouponInput('');
    } catch (err) {
      setCouponError(getApiErrorMessage(err, 'Could not apply that coupon'));
    } finally {
      setCouponBusy(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponBusy(true);
    try {
      await removeCoupon();
      showToast('Coupon removed');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not remove coupon'), 'error');
    } finally {
      setCouponBusy(false);
    }
  };

  if (!loading && cart.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <ShoppingBasketOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Add a few things from the shop to get started.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" size="large">
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Your Cart
      </Typography>

      {cart.hasUnavailableItems && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some items in your cart are out of stock or no longer available in the quantity you
          requested. Update or remove them before checking out.
        </Alert>
      )}

      <Stack spacing={2} sx={{ mb: 4 }}>
        {cart.items.map((item) => (
          <Paper key={item.id} variant="outlined" sx={{ p: 2, opacity: item.available ? 1 : 0.6 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size="auto">
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 1.5,
                    bgcolor: 'grey.100',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.productImage ? (
                    <Box
                      component="img"
                      src={resolveImageUrl(item.productImage)}
                      alt={item.productName}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ShoppingBasketOutlinedIcon sx={{ color: 'grey.400' }} />
                  )}
                </Box>
              </Grid>
              <Grid size="grow">
                <Typography fontWeight={700}>{item.productName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(item.unitPrice)} each
                </Typography>
                {!item.available && (
                  <Typography variant="caption" color="error">
                    Only {item.availableStock} available — please update the quantity
                  </Typography>
                )}
              </Grid>
              <Grid size="auto">
                <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <IconButton
                    size="small"
                    disabled={busyItemId === item.id || item.quantity <= 1}
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    disabled={busyItemId === item.id || item.quantity >= item.availableStock}
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Grid>
              <Grid size="auto" sx={{ minWidth: 90, textAlign: 'right' }}>
                <Typography fontWeight={700}>{formatCurrency(item.subtotal)}</Typography>
              </Grid>
              <Grid size="auto">
                <IconButton onClick={() => handleRemove(item)} disabled={busyItemId === item.id} aria-label="Remove item">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          {cart.couponCode ? (
            <Chip
              icon={<LocalOfferOutlinedIcon />}
              label={`Coupon "${cart.couponCode}" applied`}
              color="secondary"
              variant="outlined"
              onDelete={handleRemoveCoupon}
              disabled={couponBusy}
              sx={{ alignSelf: 'flex-start', mb: 1 }}
            />
          ) : (
            <Box component="form" onSubmit={handleApplyCoupon} sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Have a coupon code?"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  fullWidth
                  error={Boolean(couponError)}
                />
                <Button type="submit" variant="outlined" disabled={couponBusy || !couponInput.trim()}>
                  Apply
                </Button>
              </Stack>
              {couponError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {couponError}
                </Typography>
              )}
            </Box>
          )}

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Items total</Typography>
            <Typography>{formatCurrency(cart.itemsTotal)}</Typography>
          </Stack>
          {cart.discountAmount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">
                Coupon discount {cart.couponCode ? `(${cart.couponCode})` : ''}
              </Typography>
              <Typography color="secondary.main">-{formatCurrency(cart.discountAmount)}</Typography>
            </Stack>
          )}
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{formatCurrency(cart.payableTotal ?? cart.itemsTotal)}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Delivery charge (if any) is calculated at checkout.
          </Typography>
          <Button
            variant="contained"
            size="large"
            disabled={cart.hasUnavailableItems}
            onClick={() => navigate('/checkout')}
            sx={{ mt: 1 }}
          >
            Proceed to Checkout
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}