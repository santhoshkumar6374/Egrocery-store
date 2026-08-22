import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, Paper, TextField, Button, Stack, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { adminDeliverySettingsApi } from '../../../api/adminDeliverySettingsApi';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function AdminDeliverySettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { baseCharge: '', pricePerKm: '', freeDeliveryAboveAmount: '', maxDeliveryDistanceKm: '' } });

  useEffect(() => {
    adminDeliverySettingsApi
      .get()
      .then(({ data }) =>
        reset({ ...data.data, maxDeliveryDistanceKm: data.data.maxDeliveryDistanceKm ?? '' }),
      )
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load delivery settings')))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        baseCharge: Number(values.baseCharge),
        pricePerKm: Number(values.pricePerKm),
        freeDeliveryAboveAmount: Number(values.freeDeliveryAboveAmount),
        maxDeliveryDistanceKm: values.maxDeliveryDistanceKm === '' ? null : Number(values.maxDeliveryDistanceKm),
      };
      const { data } = await adminDeliverySettingsApi.update(payload);
      reset({ ...data.data, maxDeliveryDistanceKm: data.data.maxDeliveryDistanceKm ?? '' });
      showToast('Delivery settings updated');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not save these settings'), 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Delivery Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Delivery fee = base charge + (distance in km × price per km), waived above the free
        delivery threshold. Addresses beyond the delivery radius are turned away automatically —
        both when a customer previews the fee and when they try to place the order.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <TextField
              label="Base charge"
              type="number"
              fullWidth
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                htmlInput: { step: '0.01', min: 0 },
              }}
              error={Boolean(errors.baseCharge)}
              helperText={errors.baseCharge?.message}
              {...register('baseCharge', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
            />
            <TextField
              label="Price per km"
              type="number"
              fullWidth
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                htmlInput: { step: '0.01', min: 0 },
              }}
              error={Boolean(errors.pricePerKm)}
              helperText={errors.pricePerKm?.message}
              {...register('pricePerKm', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
            />
            <TextField
              label="Free delivery above"
              type="number"
              fullWidth
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                htmlInput: { step: '0.01', min: 0 },
              }}
              error={Boolean(errors.freeDeliveryAboveAmount)}
              helperText={errors.freeDeliveryAboveAmount?.message}
              {...register('freeDeliveryAboveAmount', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
            />
            <TextField
              label="Maximum delivery distance"
              type="number"
              fullWidth
              placeholder="Leave blank for no limit"
              slotProps={{
                input: { endAdornment: <InputAdornment position="end">km</InputAdornment> },
                htmlInput: { step: '0.1', min: 0.1 },
              }}
              error={Boolean(errors.maxDeliveryDistanceKm)}
              helperText={errors.maxDeliveryDistanceKm?.message || 'Orders from addresses beyond this distance are rejected'}
              {...register('maxDeliveryDistanceKm', { min: { value: 0.1, message: '> 0' } })}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'Saving…' : 'Save Settings'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}