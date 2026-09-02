import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Alert, Stack, Grid } from '@mui/material';
import { adminReportApi } from '../../../api/adminReportApi';
import StatCard from '../../../components/admin/StatCard';
import DateRangeFields from './DateRangeFields';
import ReportExportButtons from './ReportExportButtons';
import { formatCurrency } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function SalesReportTab({ from, to, setFrom, setTo }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminReportApi
      .getSales({ from, to })
      .then(({ data }) => setReport(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load the sales report')))
      .finally(() => setLoading(false));
  }, [from, to]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <ReportExportButtons exportFn={adminReportApi.exportSales} params={{ from, to }} filenameBase={`sales-report-${from}_to_${to}`} />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Total Orders" value={report.totalOrders} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Total Revenue" value={formatCurrency(report.totalRevenue)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Items Sold" value={report.totalItemsSold} />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ overflowX: 'auto', width: '100%', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.dailyBreakdown.map((d) => (
                  <TableRow key={d.date}>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{d.date}</TableCell>
                    <TableCell align="right">{d.orders}</TableCell>
                    <TableCell align="right">{formatCurrency(d.revenue)}</TableCell>
                  </TableRow>
                ))}
                {report.dailyBreakdown.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No data for this range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}