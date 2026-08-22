import { useState } from 'react';
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
  Stack,
  Alert,
  Box,
} from '@mui/material';
import { addressApi } from '../../api/addressApi';
import { getApiErrorMessage } from '../../utils/apiError';

const LABELS = ['HOME', 'WORK', 'OTHER'];

export default function AddAddressDialog({ open, onClose, onAdded }) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { label: 'HOME', addressLine: '', city: '', state: '', pincode: '' },
  });

  const handleClose = () => {
    reset();
    setServerError('');
    onClose();
  };

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { data } = await addressApi.add(values);
      onAdded(data.data);
      handleClose();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Could not save this address'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add a delivery address</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Stack spacing={2}>
            <Controller
              name="label"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Label" fullWidth>
                  {LABELS.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l.charAt(0) + l.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              minRows={2}
              error={Boolean(errors.addressLine)}
              helperText={errors.addressLine?.message}
              {...register('addressLine', { required: 'Address is required' })}
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField label="City" fullWidth {...register('city')} />
              </Grid>
              <Grid size={6}>
                <TextField label="State" fullWidth {...register('state')} />
              </Grid>
            </Grid>
            <TextField label="Pincode" fullWidth {...register('pincode')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Address'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}