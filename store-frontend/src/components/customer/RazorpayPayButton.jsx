import { useState } from 'react';
import { Button, Alert, Box } from '@mui/material';
import { paymentApi } from '../../api/paymentApi';
import { loadRazorpayScript } from '../../utils/loadRazorpayScript';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';
import { SHOP_NAME } from '../../utils/constants';

/**
 * Full online-payment flow: initiate on our backend -> open Razorpay's
 * Checkout widget (loaded from their CDN, there's no npm package for it) ->
 * verify the signature on our backend once the widget calls back.
 *
 * NOTE: written against Razorpay's long-stable, well-documented Checkout.js
 * API (options shape, `handler`, `payment.failed` event). Worth a quick check
 * against their current docs before going live, since this couldn't be
 * exercised against a live Razorpay account in this build environment.
 */
export default function RazorpayPayButton({ orderId, orderNumber, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: initiateRes } = await paymentApi.initiate(orderId);
      const payment = initiateRes.data;

      if (payment.codConfirmed) {
        showToast('Cash on Delivery confirmed');
        onSuccess?.();
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError('Could not load the payment window. Please check your connection and try again.');
        return;
      }

      const options = {
        key: payment.razorpayKeyId,
        amount: Math.round(Number(payment.amount) * 100),
        currency: payment.currency || 'INR',
        name: SHOP_NAME,
        description: `Order ${orderNumber}`,
        order_id: payment.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.mobile },
        theme: { color: '#2F5233' },
        handler: async (response) => {
          try {
            await paymentApi.verify(orderId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            showToast('Payment successful!');
            onSuccess?.();
          } catch (verifyError) {
            setError(
              getApiErrorMessage(verifyError, 'Payment verification failed. If money was deducted, it will be refunded.'),
            );
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        setError(response?.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not start payment. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button variant="contained" size="large" onClick={handlePay} disabled={loading}>
        {loading ? 'Opening payment window…' : 'Pay Now'}
      </Button>
    </Box>
  );
}