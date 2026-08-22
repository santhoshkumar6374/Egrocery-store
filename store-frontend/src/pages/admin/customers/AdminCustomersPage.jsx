import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Pagination,
  InputAdornment,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { adminCustomerApi } from '../../../api/adminCustomerApi';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

const PAGE_SIZE = 15;

export default function AdminCustomersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keywordInput, setKeywordInput] = useState(searchParams.get('keyword') ?? '');

  const keyword = searchParams.get('keyword') ?? '';
  const status = searchParams.get('status') ?? '';
  const pageNumber = Number(searchParams.get('page') ?? 0);

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

  useEffect(() => {
    setLoading(true);
    setError('');
    adminCustomerApi
      .search({ keyword: keyword || undefined, status: status || undefined, page: pageNumber, size: PAGE_SIZE })
      .then(({ data }) => setPage(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load customers')))
      .finally(() => setLoading(false));
  }, [keyword, status, pageNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ keyword: keywordInput });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Customers
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, email, or mobile…"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlinedIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>
        <TextField select size="small" label="Status" value={status} onChange={(e) => updateParams({ status: e.target.value })} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="BLOCKED">Blocked</MenuItem>
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
                  <TableCell>Customer</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Total Spent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((c) => (
                  <TableRow key={c.id} hover onClick={() => navigate(`/admin/customers/${c.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {c.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.mobile}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {c.totalOrders}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {formatCurrency(c.totalSpent)}
                    </TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small" color={c.status === 'ACTIVE' ? 'success' : 'error'} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{formatDateTime(c.joinedAt)}</TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No customers match your filters.
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