import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Pagination,
} from '@mui/material';
import { adminPaymentApi } from '../../../api/adminPaymentApi';
import MarkPaymentStatusDialog from './MarkPaymentStatusDialog';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

const STATUS_COLOR = { PENDING: 'warning', SUCCESS: 'success', FAILED: 'error', REFUNDED: 'default' };
const PAGE_SIZE = 15;

export default function AdminPaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState(null);

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

  const loadPayments = useCallback(() => {
    setLoading(true);
    setError('');
    adminPaymentApi
      .list({ status: status || undefined, page: pageNumber, size: PAGE_SIZE })
      .then(({ data }) => setPage(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load payments')))
      .finally(() => setLoading(false));
  }, [status, pageNumber]);

  useEffect(loadPayments, [loadPayments]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Payments</Typography>
        <TextField select size="small" label="Status" value={status} onChange={(e) => updateParams({ status: e.target.value })} sx={{ minWidth: 180 }}>
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="SUCCESS">Success</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
          <MenuItem value="REFUNDED">Refunded</MenuItem>
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
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{p.orderNumber}</TableCell>
                    <TableCell>{p.method?.replace(/_/g, ' ')}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip label={p.status} size="small" color={STATUS_COLOR[p.status] ?? 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{formatDateTime(p.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => setEditTarget(p)}>
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No payments match your filters.
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

      <MarkPaymentStatusDialog open={Boolean(editTarget)} payment={editTarget} onClose={() => setEditTarget(null)} onSaved={loadPayments} />
    </Box>
  );
}