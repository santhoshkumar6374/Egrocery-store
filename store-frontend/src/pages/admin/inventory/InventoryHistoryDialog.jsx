import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Box,
  Typography,
  Pagination,
  Stack,
} from '@mui/material';
import { adminInventoryApi } from '../../../api/adminInventoryApi';
import { formatDateTime } from '../../../utils/formatters';

const TYPE_COLOR = {
  STOCK_IN: 'success',
  RETURN: 'success',
  STOCK_OUT: 'error',
  SALE: 'default',
  ADJUSTMENT: 'warning',
};

export default function InventoryHistoryDialog({ open, item, onClose }) {
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    setPageNumber(0);
  }, [open, item]);

  useEffect(() => {
    if (!open || !item) return;
    setLoading(true);
    adminInventoryApi
      .getHistory(item.productId, { page: pageNumber, size: 10 })
      .then(({ data }) => setPage(data.data))
      .finally(() => setLoading(false));
  }, [open, item, pageNumber]);

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Stock history — {item.productName}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : page.content.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No stock movements recorded yet.
          </Typography>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">New stock</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>{formatDateTime(h.createdAt)}</TableCell>
                    <TableCell>
                      <Chip label={h.changeType} size="small" color={TYPE_COLOR[h.changeType] ?? 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {h.quantityChanged > 0 ? `+${h.quantityChanged}` : h.quantityChanged}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {h.newStock}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{h.reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {page.totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Pagination count={page.totalPages} page={pageNumber + 1} onChange={(_e, v) => setPageNumber(v - 1)} size="small" />
              </Stack>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}