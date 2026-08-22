import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { adminCouponApi } from '../../../api/adminCouponApi';
import { getApiErrorMessage } from '../../../utils/apiError';

function toLocalInputValue(isoString) {
  if (!isoString) return '';
  return isoString.slice(0, 16);
}

const DEFAULTS = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: 0,
  maxDiscountAmount: '',
  usageLimit: '',
  onePerUser: true,
  validFrom: '',
  validUntil: '',
  status: 'ACTIVE',
};

export default function CouponFormDialog({ open, coupon, onClose, onSaved }) {
  const [serverError, setServerError] = useState('');
  const isEdit = Boolean(coupon);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULTS });

  useEffect(() => {
    if (open) {
      reset(
        coupon
          ? {
              code: coupon.code,
              description: coupon.description ?? '',
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              minOrderAmount: coupon.minOrderAmount,
              maxDiscountAmount: coupon.maxDiscountAmount ?? '',
              usageLimit: coupon.usageLimit ?? '',
              onePerUser: coupon.onePerUser,
              validFrom: toLocalInputValue(coupon.validFrom),
              validUntil: toLocalInputValue(coupon.validUntil),
              status: coupon.status,
            }
          : DEFAULTS,
      );
      setServerError('');
    }
  }, [open, coupon, reset]);

  const onSubmit = async (values) => {
    setServerError('');
    const payload = {
      ...values,
      discountValue: Number(values.discountValue),
      minOrderAmount: values.minOrderAmount === '' ? 0 : Number(values.minOrderAmount),
      maxDiscountAmount: values.maxDiscountAmount === '' ? null : Number(values.maxDiscountAmount),
      usageLimit: values.usageLimit === '' ? null : Number(values.usageLimit),
    };
    try {
      if (isEdit) {
        await adminCouponApi.update(coupon.id, payload);
      } else {
        await adminCouponApi.create(payload);
      }
      onSaved();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Could not save this coupon'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Coupon code"
                fullWidth
                autoFocus
                error={Boolean(errors.code)}
                helperText={errors.code?.message}
                {...register('code', { required: 'Code is required' })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Discount type" fullWidth>
                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                    <MenuItem value="FLAT">Flat amount</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Description" fullWidth {...register('description')} />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Discount value"
                type="number"
                fullWidth
                error={Boolean(errors.discountValue)}
                helperText={errors.discountValue?.message}
                {...register('discountValue', { required: 'Required', min: { value: 0.01, message: '> 0' } })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField label="Min order (₹)" type="number" fullWidth {...register('minOrderAmount', { min: 0 })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Max discount cap (₹, optional)" type="number" fullWidth {...register('maxDiscountAmount')} />
            </Grid>

            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField label="Usage limit (optional)" type="number" fullWidth {...register('usageLimit', { min: 1 })} />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller
                name="onePerUser"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="One use per customer" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Valid from"
                type="datetime-local"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.validFrom)}
                helperText={errors.validFrom?.message}
                {...register('validFrom', { required: 'Required' })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Valid until"
                type="datetime-local"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.validUntil)}
                helperText={errors.validUntil?.message}
                {...register('validUntil', { required: 'Required' })}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}