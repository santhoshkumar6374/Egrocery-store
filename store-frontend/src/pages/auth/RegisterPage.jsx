import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Stack, Link, Grid } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', mobile: '', password: '', confirmPassword: '' } });

  const password = watch('password');

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }) => {
    setServerError('');
    try {
      await registerUser(values);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Could not create your account. Please try again.'));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="overline" color="secondary.main">
        Get started
      </Typography>
      <Typography variant="h3" sx={{ mb: 0.5 }}>
        Create your account
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Order groceries online — pack for pickup, or have them delivered.
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <TextField
          label="Full name"
          fullWidth
          autoFocus
          autoComplete="name"
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register('name', { required: 'Name is required', maxLength: { value: 100, message: 'Name is too long' } })}
        />
        <TextField
          label="Email address"
          type="email"
          fullWidth
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })}
        />
        <TextField
          label="Mobile number"
          fullWidth
          autoComplete="tel"
          placeholder="10-digit mobile number"
          error={Boolean(errors.mobile)}
          helperText={errors.mobile?.message}
          {...register('mobile', {
            required: 'Mobile number is required',
            pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
          })}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Password"
              type="password"
              fullWidth
              autoComplete="new-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              autoComplete="new-password"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.3 }}>
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </Stack>

      <Typography sx={{ mt: 4 }} color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
          Log in
        </Link>
      </Typography>
    </Box>
  );
}