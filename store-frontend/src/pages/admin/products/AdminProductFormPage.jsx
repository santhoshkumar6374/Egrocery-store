import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import { adminProductApi } from '../../../api/adminProductApi';
import { adminCategoryApi } from '../../../api/adminCategoryApi';
import { resolveImageUrl } from '../../../utils/formatters';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

const UNITS = ['KG', 'GRAM', 'LITER', 'ML', 'PACKET', 'PIECE'];

const DEFAULT_VALUES = {
  name: '',
  categoryId: '',
  brand: '',
  mrp: '',
  discountPercent: 0,
  unit: 'PACKET',
  weightValue: '',
  description: '',
  status: 'ACTIVE',
  initialStock: 0,
  lowStockThreshold: 10,
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = id !== 'new';
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const mrp = watch('mrp');
  const discountPercent = watch('discountPercent');
  const previewPrice = mrp && discountPercent != null ? (mrp * (1 - discountPercent / 100)).toFixed(2) : null;

  useEffect(() => {
    adminCategoryApi
      .list()
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  const loadProduct = () => {
    if (!isEdit) return;
    setLoading(true);
    adminProductApi
      .getById(id)
      .then(({ data }) => {
        const p = data.data;
        setProduct(p);
        reset({
          name: p.name,
          categoryId: String(p.category.id),
          brand: p.brand ?? '',
          mrp: p.mrp,
          discountPercent: p.discountPercent,
          unit: p.unit,
          weightValue: p.weightValue,
          description: p.description ?? '',
          status: p.status,
          lowStockThreshold: p.lowStockThreshold,
        });
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this product')))
      .finally(() => setLoading(false));
  };

  useEffect(loadProduct, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      categoryId: Number(values.categoryId),
      mrp: Number(values.mrp),
      discountPercent: Number(values.discountPercent),
      weightValue: Number(values.weightValue),
      initialStock: values.initialStock != null ? Number(values.initialStock) : undefined,
      lowStockThreshold: Number(values.lowStockThreshold),
    };

    try {
      if (isEdit) {
        await adminProductApi.update(id, payload);
        showToast('Product updated');
        loadProduct();
      } else {
        const { data } = await adminProductApi.create(payload);
        showToast('Product created — now add some photos');
        navigate(`/admin/products/${data.data.id}`, { replace: true });
      }
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not save this product'), 'error');
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await adminProductApi.uploadImage(id, file);
      showToast('Image uploaded');
      loadProduct();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not upload that image'), 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setAddingUrl(true);
    try {
      await adminProductApi.addImageUrl(id, imageUrl.trim());
      showToast('Image URL added');
      setImageUrl('');
      loadProduct();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not add image URL'), 'error');
    } finally {
      setAddingUrl(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await adminProductApi.deleteImage(id, imageId);
      showToast('Image removed');
      loadProduct();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not remove that image'), 'error');
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
    <Box sx={{ maxWidth: 800 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/products" underline="hover" color="text.secondary">
          Products
        </Link>
        <Typography color="text.primary">{isEdit ? product?.name : 'New Product'}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEdit ? 'Edit Product' : 'New Product'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField
                label="Product name"
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="categoryId"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <TextField {...field} select label="Category" fullWidth error={Boolean(errors.categoryId)} helperText={errors.categoryId?.message}>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Brand" fullWidth {...register('brand')} />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="MRP (₹)"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                error={Boolean(errors.mrp)}
                helperText={errors.mrp?.message}
                {...register('mrp', { required: 'Required', min: { value: 0.01, message: '> 0' } })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Discount %"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, max: 90 } }}
                error={Boolean(errors.discountPercent)}
                helperText={errors.discountPercent?.message || (previewPrice ? `Sells at ₹${previewPrice}` : ' ')}
                {...register('discountPercent', { required: 'Required', min: 0, max: { value: 90, message: '≤ 90' } })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Unit" fullWidth>
                    {UNITS.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Weight/Qty value"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                error={Boolean(errors.weightValue)}
                helperText={errors.weightValue?.message}
                {...register('weightValue', { required: 'Required', min: { value: 0.01, message: '> 0' } })}
              />
            </Grid>

            <Grid size={12}>
              <TextField label="Description" fullWidth multiline minRows={3} {...register('description')} />
            </Grid>

            {!isEdit && (
              <Grid size={{ xs: 6, sm: 6 }}>
                <TextField
                  label="Initial stock"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 0 } }}
                  {...register('initialStock', { min: 0 })}
                />
              </Grid>
            )}
            <Grid size={{ xs: 6, sm: isEdit ? 6 : 6 }}>
              <TextField
                label="Low stock threshold"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0 } }}
                {...register('lowStockThreshold', { min: 0 })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {isEdit && (
        <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Photos
          </Typography>

          {/* Add photo via URL input form */}
          <Box component="form" onSubmit={handleAddImageUrl} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Add Photo by Image URL
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                size="small"
                fullWidth
                placeholder="https://example.com/product-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InsertLinkOutlinedIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={addingUrl || !imageUrl.trim()}
                sx={{ whiteSpace: 'nowrap', px: 3, fontWeight: 700 }}
              >
                {addingUrl ? <CircularProgress size={20} color="inherit" /> : 'Add URL'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Current Product Photos
          </Typography>

          <Grid container spacing={2}>
            {product?.images?.map((image) => (
              <Grid key={image.id} size={{ xs: 6, sm: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      aspectRatio: '1 / 1',
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'grey.100',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box component="img" src={resolveImageUrl(image.imageUrl)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteImage(image.id)}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      '&:hover': { bgcolor: '#ffffff', color: 'error.main' },
                    }}
                    aria-label="Remove photo"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={18} /> : <AddPhotoAlternateOutlinedIcon />}
                disabled={uploading}
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  flexDirection: 'column',
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Upload File
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFileSelected} />
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}