import { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Pagination,
  InputAdornment,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { adminProductApi } from '../../../api/adminProductApi';
import { adminCategoryApi } from '../../../api/adminCategoryApi';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { resolveImageUrl, formatCurrency } from '../../../utils/formatters';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

const PAGE_SIZE = 15;

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') ?? '');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const keyword = searchParams.get('keyword') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const pageNumber = Number(searchParams.get('page') ?? 0);

  useEffect(() => {
    adminCategoryApi
      .list()
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) next.delete(key);
        else next.set(key, value);
      });
      if (!('page' in updates)) next.delete('page');
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError('');
    adminProductApi
      .search({ keyword: keyword || undefined, categoryId: categoryId || undefined, page: pageNumber, size: PAGE_SIZE })
      .then(({ data }) => setPage(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load products')))
      .finally(() => setLoading(false));
  }, [keyword, categoryId, pageNumber]);

  useEffect(loadProducts, [loadProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ keyword: keywordInput });
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminProductApi.setStatus(product.id, nextStatus);
      showToast(`Product ${nextStatus === 'ACTIVE' ? 'enabled' : 'disabled'}`);
      loadProducts();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update status'), 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminProductApi.remove(deleteTarget.id);
      showToast('Product deleted');
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete this product'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button component={RouterLink} to="/admin/products/new" variant="contained" startIcon={<AddIcon />}>
          New Product
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products…"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlinedIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>
        <TextField
          select
          size="small"
          label="Category"
          value={categoryId}
          onChange={(e) => updateParams({ categoryId: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Paper variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {product.primaryImageUrl && (
                            <Box
                              component="img"
                              src={resolveImageUrl(product.primaryImageUrl)}
                              alt=""
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.brand}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.inStock ? 'In stock' : 'Out of stock'}
                        size="small"
                        color={product.inStock ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch checked={product.status === 'ACTIVE'} onChange={() => handleToggleStatus(product)} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton component={RouterLink} to={`/admin/products/${product.id}`} size="small">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(product)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No products match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          {page.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={page.totalPages} page={pageNumber + 1} onChange={(_e, v) => updateParams({ page: String(v - 1) })} />
            </Stack>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={`"${deleteTarget?.name}" will be permanently deleted. Products with order history can't be deleted — disable them instead.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}