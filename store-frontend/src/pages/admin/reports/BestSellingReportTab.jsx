import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Alert, Stack, TextField } from '@mui/material';
import { adminReportApi } from '../../../api/adminReportApi';
import DateRangeFields from './DateRangeFields';
import ReportExportButtons from './ReportExportButtons';
import { formatCurrency } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function BestSellingReportTab({ from, to, setFrom, setTo }) {
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminReportApi
      .getBestSelling({ from, to, limit })
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load best sellers')))
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
              onChange={(e) => setLimit(Number(e.target.value) || 10)}
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { min: 1, max: 100 } }}
            />
          }
        />
        <ReportExportButtons
          exportFn={adminReportApi.exportBestSelling}
          params={{ from, to, limit }}
          filenameBase={`best-selling-${from}_to_${to}`}
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
                <TableCell>Product</TableCell>
                <TableCell align="right">Quantity Sold</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.productId} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{p.productName}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {p.quantitySold}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(p.revenue)}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No sales in this range.
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