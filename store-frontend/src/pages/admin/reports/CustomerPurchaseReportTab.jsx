import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Alert, Stack, TextField } from '@mui/material';
import { adminReportApi } from '../../../api/adminReportApi';
import DateRangeFields from './DateRangeFields';
import ReportExportButtons from './ReportExportButtons';
import { formatCurrency } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function CustomerPurchaseReportTab({ from, to, setFrom, setTo }) {
  const [limit, setLimit] = useState(50);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminReportApi
      .getCustomerPurchases({ from, to, limit })
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load customer purchases')))
      .finally(() => setLoading(false));
  }, [from, to, limit]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <DateRangeFields
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          extra={
            <TextField
              label="Limit"
              type="number"
              size="small"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 50)}
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { min: 1, max: 200 } }}
            />
          }
        />
        <ReportExportButtons
          exportFn={adminReportApi.exportCustomerPurchases}
          params={{ from, to, limit }}
          filenameBase={`customer-purchases-${from}_to_${to}`}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Total Spent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.customerId} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{c.customerName}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{c.customerEmail}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {c.totalOrders}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(c.totalSpent)}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No purchases in this range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}