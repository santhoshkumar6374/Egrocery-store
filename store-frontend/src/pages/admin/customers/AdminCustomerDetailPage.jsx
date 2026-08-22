import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import { adminCustomerApi } from '../../../api/adminCustomerApi';
import OrderStatusChip from '../../../components/common/OrderStatusChip';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState({ content: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadCustomer = () => {
    setLoading(true);
    Promise.all([adminCustomerApi.getById(id), adminCustomerApi.getOrders(id, { page: 0, size: 10 })])
      .then(([customerRes, ordersRes]) => {
        setCustomer(customerRes.data.data);
        setOrders(ordersRes.data.data);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this customer')))
      .finally(() => setLoading(false));
  };

  useEffect(loadCustomer, [id]);

  const handleToggleStatus = async () => {
    setStatusBusy(true);
    const nextStatus = customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await adminCustomerApi.setStatus(id, nextStatus);
      showToast(nextStatus === 'BLOCKED' ? 'Customer blocked' : 'Customer activated');
      loadCustomer();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update status'), 'error');
    } finally {
      setStatusBusy(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminCustomerApi.remove(id);
      showToast('Customer deleted');
      navigate('/admin/customers', { replace: true });
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete this customer'), 'error');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !customer) {
    return <Alert severity="error">{error || 'Customer not found'}</Alert>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/customers" underline="hover" color="text.secondary">
          Customers
        </Link>
        <Typography color="text.primary">{customer.name}</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">{customer.name}</Typography>
          <Typography color="text.secondary">
            {customer.email} · {customer.mobile}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Chip label={customer.status} color={customer.status === 'ACTIVE' ? 'success' : 'error'} />
          <Button variant="outlined" onClick={handleToggleStatus} disabled={statusBusy}>
            {customer.status === 'ACTIVE' ? 'Block Customer' : 'Activate Customer'}
          </Button>
          <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Total Orders
            </Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.5rem' }}>
              {customer.totalOrders}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Total Spent
            </Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.5rem' }}>
              {formatCurrency(customer.totalSpent)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Customer Since
            </Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.5rem' }}>
              {formatDateTime(customer.joinedAt)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Saved Addresses
            </Typography>
            {customer.addresses.length === 0 ? (
              <Typography color="text.secondary">No saved addresses.</Typography>
            ) : (
              <Stack spacing={2} divider={<Divider />}>
                {customer.addresses.map((addr) => (
                  <Box key={addr.id}>
                    <Chip label={addr.label} size="small" sx={{ mb: 0.5 }} />
                    <Typography variant="body2">{addr.addressLine}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {addr.city} {addr.pincode}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Orders
            </Typography>
            {orders.content.length === 0 ? (
              <Typography color="text.secondary">No orders yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.content.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>{o.orderNumber}</TableCell>
                      <TableCell>
                        <OrderStatusChip status={o.status} />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(o.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete customer?"
        message={`"${customer.name}" will be permanently deleted. Customers with order history can't be deleted — block them instead.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
}