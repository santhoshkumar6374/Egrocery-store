import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Stack, Link, InputAdornment, IconButton } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';
import { ROLES } from '../../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await login(values.email, values.password);
      const redirectTo = location.state?.from?.pathname;
      if (redirectTo && redirectTo !== '/login') {
        navigate(redirectTo, { replace: true });
      } else if (user.roles?.includes(ROLES.ADMIN)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Could not log you in. Check your email and password.'));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="overline" color="secondary.main">
        Welcome back
      </Typography>
      <Typography variant="h3" sx={{ mb: 0.5 }}>
        Log in
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Pick up where you left off — your cart's waiting.
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <TextField
          label="Email address"
          type="email"
          fullWidth
          autoComplete="email"
          autoFocus
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="Toggle password visibility">
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register('password', { required: 'Password is required' })}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.3 }}>
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </Button>
      </Stack>

      <Typography sx={{ mt: 4 }} color="text.secondary">
        New here?{' '}
        <Link component={RouterLink} to="/register" underline="hover" fontWeight={600}>
          Create an account
        </Link>
      </Typography>
    </Box>
  );
}