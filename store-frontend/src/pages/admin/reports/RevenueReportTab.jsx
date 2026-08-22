import { useEffect, useState } from 'react';
import { Box, Paper, Stack, Grid, CircularProgress, Alert, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { adminReportApi } from '../../../api/adminReportApi';
import DateRangeFields from './DateRangeFields';
import ReportExportButtons from './ReportExportButtons';
import { formatCurrency } from '../../../utils/formatters';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function RevenueReportTab({ from, to, setFrom, setTo }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminReportApi
      .getRevenue({ from, to })
      .then(({ data }) => setReport(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load the revenue report')))
      .finally(() => setLoading(false));
  }, [from, to]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <ReportExportButtons exportFn={adminReportApi.exportRevenue} params={{ from, to }} filenameBase={`revenue-report-${from}_to_${to}`} />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2.5}>
          <Grid size={12}>
            <Paper variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Orders</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {report.orderCount}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gross Items Revenue</TableCell>
                    <TableCell align="right">{formatCurrency(report.grossItemsRevenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Delivery Fees Collected</TableCell>
                    <TableCell align="right">{formatCurrency(report.deliveryFeesCollected)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Discounts Given</TableCell>
                    <TableCell align="right" sx={{ color: 'secondary.main' }}>
                      -{formatCurrency(report.discountsGiven)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Net Revenue</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: '"Fraunces", serif', fontSize: '1.1rem' }}>
                      {formatCurrency(report.netRevenue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}