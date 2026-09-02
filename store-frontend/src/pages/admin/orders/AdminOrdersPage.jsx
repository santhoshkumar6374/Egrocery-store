import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Pagination,
} from '@mui/material';
import OrderStatusChip from '../../../components/common/OrderStatusChip';
import { adminOrderApi } from '../../../api/adminOrderApi';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

const STATUSES = ['PLACED', 'ACCEPTED', 'PACKED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const PAGE_SIZE = 15;

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const status = searchParams.get('status') ?? '';
  const pageNumber = Number(searchParams.get('page') ?? 0);

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value == null) next.delete(key);
        else next.set(key, value);
      });
      if (!('page' in updates)) next.delete('page');
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    setLoading(true);
    setError('');
    adminOrderApi
      .list({ status: status || undefined, page: pageNumber, size: PAGE_SIZE })
      .then(({ data }) => setPage(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load orders')))
      .finally(() => setLoading(false));
  }, [status, pageNumber]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
        <TextField select size="small" label="Status" value={status} onChange={(e) => updateParams({ status: e.target.value })} sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
          <MenuItem value="">All Statuses</MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace(/_/g, ' ')}
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
          <Paper variant="outlined" sx={{ overflowX: 'auto', width: '100%', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Placed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((o) => (
                  <TableRow key={o.id} hover onClick={() => navigate(`/admin/orders/${o.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{o.orderNumber}</TableCell>
                    <TableCell>{o.deliveryType === 'HOME_DELIVERY' ? 'Delivery' : 'Pickup'}</TableCell>
                    <TableCell>
                      <OrderStatusChip status={o.status} />
                    </TableCell>
                    <TableCell align="right">{o.itemCount}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {formatCurrency(o.totalAmount)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{formatDateTime(o.placedAt)}</TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No orders match your filters.
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
    </Box>
  );
}