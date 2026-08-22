import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';

import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

import { addressApi } from '../../api/addressApi';
import { deliveryApi } from '../../api/deliveryApi';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { loadRazorpayScript } from '../../utils/loadRazorpayScript';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/apiError';
import { SHOP_NAME } from '../../utils/constants';
import AddAddressDialog from '../../components/customer/AddAddressDialog';

const PAYMENT_METHODS = [
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Cash on Delivery (COD)',
    subtitle: 'Pay cash or UPI upon delivery / store pickup',
  },
  {
    value: 'UPI',
    label: 'UPI (GPay / PhonePe / Paytm / BHIM)',
    subtitle: 'Fast & secure UPI payment via Razorpay',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Credit / Debit Card',
    subtitle: 'Visa, MasterCard, RuPay & Maestro cards',
  },
  {
    value: 'NET_BANKING',
    label: 'Net Banking',
    subtitle: 'All major Indian banks supported',
  },
];

export default function CheckoutPage() {
  const { cart, refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('PACK_MY_ORDER');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [paymentStatusText, setPaymentStatusText] = useState('');

  useEffect(() => {
    addressApi
      .list()
      .then(({ data }) => {
        setAddresses(data.data || []);
        const defaultAddress = (data.data || []).find((a) => a.isDefault) ?? data.data?.[0];
        if (defaultAddress) setSelectedAddressId(defaultAddress.id);
      })
      .catch(() => setAddresses([]));
  }, []);

  useEffect(() => {
    if (deliveryType !== 'HOME_DELIVERY' || !selectedAddressId) {
      setEstimate(null);
      return;
    }
    setEstimateLoading(true);
    setEstimateError('');
    deliveryApi
      .estimate(selectedAddressId)
      .then(({ data }) => setEstimate(data.data))
      .catch((err) => {
        setEstimate(null);
        setEstimateError(getApiErrorMessage(err, 'Could not calculate delivery for this address'));
      })
      .finally(() => setEstimateLoading(false));
  }, [deliveryType, selectedAddressId]);

  if (cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const deliveryFee = deliveryType === 'HOME_DELIVERY' ? estimate?.deliveryFee ?? 0 : 0;
  const discount = cart.discountAmount ?? 0;
  const total = Math.max(0, (cart.itemsTotal ?? 0) - discount + Number(deliveryFee));

  const canPlaceOrder =
    !placing &&
    (deliveryType === 'PACK_MY_ORDER' || (deliveryType === 'HOME_DELIVERY' && selectedAddressId && estimate && !estimateLoading));

  const isOnlinePayment = paymentMethod !== 'CASH_ON_DELIVERY';

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError('');
    setPaymentStatusText('Creating your order...');

    try {
      // Step 1: Create Order
      const { data: orderRes } = await orderApi.place({
        deliveryType,
        addressId: deliveryType === 'HOME_DELIVERY' ? selectedAddressId : undefined,
        paymentMethod,
      });

      const createdOrder = orderRes.data;
      await refreshCart();

      // If Cash on Delivery, complete immediately
      if (!isOnlinePayment) {
        showToast('Order placed successfully!');
        navigate(`/orders/${createdOrder.id}`, { replace: true });
        return;
      }

      // Step 2: Initiate Razorpay Payment for Online Payment methods
      setPaymentStatusText('Opening Razorpay Payment Window...');
      const { data: initiateRes } = await paymentApi.initiate(createdOrder.id);
      const paymentData = initiateRes.data;

      if (paymentData.codConfirmed) {
        showToast('Cash on Delivery confirmed!');
        navigate(`/orders/${createdOrder.id}`, { replace: true });
        return;
      }

      // Load Razorpay Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        showToast('Order created! Please complete payment on the order details page.');
        navigate(`/orders/${createdOrder.id}`, { replace: true });
        return;
      }

      // Open Razorpay Popup Widget
      const options = {
        key: paymentData.razorpayKeyId,
        amount: Math.round(Number(paymentData.amount) * 100),
        currency: paymentData.currency || 'INR',
        name: SHOP_NAME,
        description: `Order #${createdOrder.orderNumber}`,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || '',
        },
        theme: { color: '#075e3f' },
        handler: async (response) => {
          setPaymentStatusText('Verifying payment signature...');
          try {
            await paymentApi.verify(createdOrder.id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            showToast('Payment successful! Your order is confirmed.');
            navigate(`/orders/${createdOrder.id}`, { replace: true });
          } catch (verifyErr) {
            showToast(
              getApiErrorMessage(verifyErr, 'Payment verification failed. Check order details.'),
              'error',
            );
            navigate(`/orders/${createdOrder.id}`, { replace: true });
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Order created! You can complete payment anytime from order details.');
            navigate(`/orders/${createdOrder.id}`, { replace: true });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (resp) => {
        showToast(resp?.error?.description || 'Payment failed. You can retry anytime.', 'error');
        navigate(`/orders/${createdOrder.id}`, { replace: true });
      });

      razorpayInstance.open();
    } catch (err) {
      setPlaceError(getApiErrorMessage(err, 'Could not place your order. Please try again.'));
      setPlacing(false);
      setPaymentStatusText('');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 800 }}>
        Checkout
      </Typography>

      {placeError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {placeError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* LEFT COLUMN: DELIVERY & PAYMENT OPTIONS */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* DELIVERY METHOD */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Delivery Method
            </Typography>
            <RadioGroup value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  borderColor: deliveryType === 'PACK_MY_ORDER' ? 'primary.main' : 'divider',
                  bgcolor: deliveryType === 'PACK_MY_ORDER' ? '#f4fbf7' : 'transparent',
                }}
              >
                <FormControlLabel
                  value="PACK_MY_ORDER"
                  control={<Radio color="primary" />}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <StorefrontOutlinedIcon color="primary" />
                      <Box>
                        <Typography fontWeight={700}>Pack My Order (Free Store Pickup)</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Collect it from the store yourself — no delivery charge.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  borderColor: deliveryType === 'HOME_DELIVERY' ? 'primary.main' : 'divider',
                  bgcolor: deliveryType === 'HOME_DELIVERY' ? '#f4fbf7' : 'transparent',
                }}
              >
                <FormControlLabel
                  value="HOME_DELIVERY"
                  control={<Radio color="primary" />}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocalShippingOutlinedIcon color="primary" />
                      <Box>
                        <Typography fontWeight={700}>Home Delivery</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Direct doorstep delivery calculated from your saved address.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </Paper>
            </RadioGroup>

            {deliveryType === 'HOME_DELIVERY' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Deliver to Address
                </Typography>
                {addresses.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    You don't have any saved addresses yet. Add one below to proceed.
                  </Alert>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                  >
                    {addresses.map((addr) => (
                      <Paper key={addr.id} variant="outlined" sx={{ p: 1.8, mb: 1, borderRadius: 2 }}>
                        <FormControlLabel
                          value={addr.id}
                          control={<Radio size="small" color="primary" />}
                          label={
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={700} variant="body2">
                                  {addr.label}
                                </Typography>
                                {addr.isDefault && (
                                  <Chip label="Default" size="small" color="primary" variant="outlined" />
                                )}
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {addr.addressLine}, {addr.city} {addr.pincode}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                )}
                <Button
                  startIcon={<AddLocationAltOutlinedIcon />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{ mt: 1, fontWeight: 700 }}
                >
                  Add a new address
                </Button>

                {estimateLoading && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                    <CircularProgress size={18} color="primary" />
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Calculating distance and delivery fee…
                    </Typography>
                  </Stack>
                )}
                {estimateError && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    {estimateError}
                  </Alert>
                )}
                {estimate && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}>
                    {estimate.distanceKm > 0 ? `${estimate.distanceKm.toFixed(1)} km away · ` : ''}
                    Estimated delivery in ~{estimate.estimatedDeliveryMinutes} min ·{' '}
                    {estimate.freeDeliveryApplied
                      ? 'Free delivery applied 🎉'
                      : `${formatCurrency(estimate.deliveryFee)} delivery fee`}
                  </Alert>
                )}
              </Box>
            )}
          </Paper>

          {/* PAYMENT METHOD */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PaymentOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Select Payment Option
              </Typography>
            </Stack>

            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Stack spacing={1.5}>
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = paymentMethod === m.value;
                  return (
                    <Paper
                      key={m.value}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? '#f4fbf7' : 'transparent',
                        transition: '0.2s ease',
                      }}
                    >
                      <FormControlLabel
                        value={m.value}
                        control={<Radio color="primary" />}
                        label={
                          <Box>
                            <Typography fontWeight={700}>{m.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {m.subtitle}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                  );
                })}
              </Stack>
            </RadioGroup>

            {isOnlinePayment ? (
              <Alert severity="info" icon={<LockOutlinedIcon />} sx={{ mt: 2.5, borderRadius: 2 }}>
                Razorpay payment window will open automatically after you click <strong>Proceed to Pay</strong>.
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mt: 2.5, borderRadius: 2 }}>
                Pay cash or scan store QR code when your order is delivered / picked up.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: ORDER SUMMARY & ACTION */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3.5,
              borderRadius: 3.5,
              position: { md: 'sticky' },
              top: { md: 90 },
              bgcolor: '#ffffff',
            }}
          >
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2.5 }}>
              Order Summary
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              {cart.items.map((item) => (
                <Stack key={item.id} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {item.productName} × {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(item.subtotal)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            <Stack spacing={1.2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Items total</Typography>
                <Typography fontWeight={700}>{formatCurrency(cart.itemsTotal)}</Typography>
              </Stack>

              {discount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Discount</Typography>
                  <Typography color="secondary.main" fontWeight={700}>
                    -{formatCurrency(discount)}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Delivery</Typography>
                <Typography fontWeight={700}>
                  {deliveryType === 'HOME_DELIVERY' ? formatCurrency(deliveryFee) : 'Free Pickup'}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={800}>
                  Total Amount
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {formatCurrency(total)}
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 3.5,
                py: 1.6,
                borderRadius: 50,
                fontWeight: 800,
                fontSize: '1rem',
                background: isOnlinePayment
                  ? 'linear-gradient(135deg, #075e3f 0%, #0aa36f 100%)'
                  : 'linear-gradient(135deg, #ffd166 0%, #ffca4f 100%)',
                color: isOnlinePayment ? '#ffffff' : '#173b2b',
                boxShadow: isOnlinePayment
                  ? '0 8px 24px rgba(7, 94, 63, 0.3)'
                  : '0 8px 24px rgba(255, 209, 102, 0.4)',
                '&:hover': {
                  background: isOnlinePayment
                    ? 'linear-gradient(135deg, #064e34 0%, #088a5e 100%)'
                    : 'linear-gradient(135deg, #ffc947 0%, #ffb703 100%)',
                },
              }}
              disabled={!canPlaceOrder}
              onClick={handlePlaceOrder}
            >
              {placing ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                  <Typography fontWeight={800} fontSize="0.95rem">
                    {paymentStatusText || 'Processing...'}
                  </Typography>
                </Stack>
              ) : isOnlinePayment ? (
                `Proceed to Pay ${formatCurrency(total)} via Razorpay 💳`
              ) : (
                'Place Order (Cash on Delivery) 🛒'
              )}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <AddAddressDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdded={(newAddress) => {
          setAddresses((prev) => [...prev, newAddress]);
          setSelectedAddressId(newAddress.id);
          showToast('Address saved successfully');
        }}
      />
    </Container>
  );
}