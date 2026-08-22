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
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Stack,
  Pagination,
} from '@mui/material';
import { adminInventoryApi } from '../../../api/adminInventoryApi';
import StockUpdateDialog from './StockUpdateDialog';
import InventoryHistoryDialog from './InventoryHistoryDialog';
import { getApiErrorMessage } from '../../../utils/apiError';

const STATUS_COLOR = { IN_STOCK: 'success', LOW_STOCK: 'warning', OUT_OF_STOCK: 'error' };
const STATUS_LABEL = { IN_STOCK: 'In stock', LOW_STOCK: 'Low stock', OUT_OF_STOCK: 'Out of stock' };

export default function AdminInventoryPage() {
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockDialogItem, setStockDialogItem] = useState(null);
  const [historyDialogItem, setHistoryDialogItem] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');

    const request =
      tab === 'LOW_STOCK'
        ? adminInventoryApi.lowStock().then(({ data }) => ({ content: data.data, totalPages: 1 }))
        : tab === 'OUT_OF_STOCK'
          ? adminInventoryApi.outOfStock().then(({ data }) => ({ content: data.data, totalPages: 1 }))
          : adminInventoryApi.list({ page: pageNumber, size: 20 }).then(({ data }) => data.data);

    request
      .then(setPage)
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load inventory')))
      .finally(() => setLoading(false));
  }, [tab, pageNumber]);

  useEffect(loadData, [loadData]);

  const handleTabChange = (_e, value) => {
    setTab(value);
    setPageNumber(0);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Inventory
      </Typography>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Products" value="ALL" />
        <Tab label="Low Stock" value="LOW_STOCK" />
        <Tab label="Out of Stock" value="OUT_OF_STOCK" />
      </Tabs>

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
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Low Stock Threshold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((item) => (
                  <TableRow key={item.productId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{item.productName}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {item.currentStock}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace', color: 'text.secondary' }}>
                      {item.lowStockThreshold}
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABEL[item.stockStatus]} size="small" color={STATUS_COLOR[item.stockStatus]} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setHistoryDialogItem(item)} sx={{ mr: 1 }}>
                        History
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => setStockDialogItem(item)}>
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Nothing here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          {tab === 'ALL' && page.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={page.totalPages} page={pageNumber + 1} onChange={(_e, v) => setPageNumber(v - 1)} />
            </Stack>
          )}
        </>
      )}

      <StockUpdateDialog
        open={Boolean(stockDialogItem)}
        item={stockDialogItem}
        onClose={() => setStockDialogItem(null)}
        onSaved={loadData}
      />
      <InventoryHistoryDialog open={Boolean(historyDialogItem)} item={historyDialogItem} onClose={() => setHistoryDialogItem(null)} />
    </Box>
  );
}