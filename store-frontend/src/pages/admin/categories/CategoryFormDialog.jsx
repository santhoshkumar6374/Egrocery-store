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
  Stack,
  Alert,
  Box,
} from '@mui/material';
import { adminCategoryApi } from '../../../api/adminCategoryApi';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function CategoryFormDialog({ open, category, onClose, onSaved }) {
  const [serverError, setServerError] = useState('');
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', description: '', imageUrl: '', status: 'ACTIVE' } });

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              description: category.description ?? '',
              imageUrl: category.imageUrl ?? '',
              status: category.status,
            }
          : { name: '', description: '', imageUrl: '', status: 'ACTIVE' },
      );
      setServerError('');
    }
  }, [open, category, reset]);

  const onSubmit = async (values) => {
    setServerError('');
    try {
      if (isEdit) {
        await adminCategoryApi.update(category.id, values);
      } else {
        await adminCategoryApi.create(values);
      }
      onSaved();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Could not save this category'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <TextField
              label="Name"
              fullWidth
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name', { required: 'Name is required', maxLength: { value: 100, message: 'Too long' } })}
            />
            <TextField label="Description" fullWidth multiline minRows={2} {...register('description')} />
            <TextField label="Image URL" fullWidth {...register('imageUrl')} placeholder="https://…" />
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
          </Stack>
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