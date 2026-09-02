import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Rating,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Pagination,
  IconButton,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import { productApi } from '../../../api/productApi';
import { reviewApi } from '../../../api/reviewApi';
import { formatDateTime } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    productApi
      .list?.({ size: 100 })
      ?.then?.(({ data }) => {
        const items = data.data.content || [];
        setProducts(items);
        if (items.length > 0) {
          setSelectedProductId(items[0].id);
        }
      })
      ?.catch?.((err) => setError(getApiErrorMessage(err, 'Failed to load products list.')))
      ?.finally?.(() => setLoadingProducts(false));

    // Fallback if productApi.list is search
    productApi
      .search({ size: 100 })
      .then(({ data }) => {
        const items = data.data.content || [];
        setProducts(items);
        if (items.length > 0) {
          setSelectedProductId(items[0].id);
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load products list.')))
      .finally(() => setLoadingProducts(false));
  }, []);

  const loadReviews = useCallback(() => {
    if (!selectedProductId) return;
    setLoadingReviews(true);
    setError('');

    reviewApi
      .adminListReviews(selectedProductId, { page: pageNumber, size: 15 })
      .then(({ data }) => setPage(data.data || { content: [], totalPages: 0 }))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load reviews for this product.')))
      .finally(() => setLoadingReviews(false));
  }, [selectedProductId, pageNumber]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.adminDeleteReview(selectedProductId, reviewId);
      showToast('Review removed.');
      loadReviews();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to delete review.'), 'error');
    }
  };

  if (loadingProducts) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <RateReviewOutlinedIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4">Product Reviews</Typography>
            <Typography variant="body2" color="text.secondary">
              Moderate and inspect customer reviews left across your store catalog
            </Typography>
          </Box>
        </Stack>

        <TextField
          select
          size="small"
          label="Select Product"
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            setPageNumber(0);
          }}
          sx={{ minWidth: 260 }}
        >
          {products.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loadingReviews ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper variant="outlined" sx={{ overflowX: 'auto', width: '100%', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Comment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.customerName}</TableCell>
                    <TableCell>
                      <Rating value={r.rating} size="small" readOnly />
                    </TableCell>
                    <TableCell color="text.secondary">{r.comment || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13, fontFamily: '"IBM Plex Mono", monospace' }}>
                      {formatDateTime(r.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(r.id)}
                        aria-label="Delete review"
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No customer reviews found for this product yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          {page.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                count={page.totalPages}
                page={pageNumber + 1}
                onChange={(_e, v) => setPageNumber(v - 1)}
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}