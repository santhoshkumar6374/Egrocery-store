import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { adminCouponApi } from '../../../api/adminCouponApi';
import CouponFormDialog from './CouponFormDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCoupons = () => {
    setLoading(true);
    adminCouponApi
      .list({ page: pageNumber, size: 15 })
      .then(({ data }) => setPage(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load coupons')))
      .finally(() => setLoading(false));
  };

  useEffect(loadCoupons, [pageNumber]);

  const handleSaved = () => {
    setFormOpen(false);
    showToast(editingCoupon ? 'Coupon updated' : 'Coupon created');
    setEditingCoupon(null);
    loadCoupons();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminCouponApi.remove(deleteTarget.id);
      showToast('Coupon deleted');
      setDeleteTarget(null);
      loadCoupons();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete this coupon'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Coupons</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCoupon(null);
            setFormOpen(true);
          }}
        >
          New Coupon
        </Button>
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
                  <TableCell>Code</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell align="right">Min Order</TableCell>
                  <TableCell align="right">Used</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.content.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}>{c.code}</TableCell>
                    <TableCell>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                      {c.maxDiscountAmount ? ` (up to ${formatCurrency(c.maxDiscountAmount)})` : ''}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(c.minOrderAmount)}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {c.usedCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>{formatDateTime(c.validUntil)}</TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small" color={c.status === 'ACTIVE' ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingCoupon(c);
                          setFormOpen(true);
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(c)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {page.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No coupons yet — create your first one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          {page.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={page.totalPages} page={pageNumber + 1} onChange={(_e, v) => setPageNumber(v - 1)} />
            </Stack>
          )}
        </>
      )}

      <CouponFormDialog open={formOpen} coupon={editingCoupon} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete coupon?"
        message={`"${deleteTarget?.code}" will be permanently deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}