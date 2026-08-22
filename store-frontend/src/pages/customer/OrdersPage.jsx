import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Box,
  CircularProgress,
  Pagination,
  Button,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { orderApi } from '../../api/orderApi';
import OrderStatusChip from '../../components/common/OrderStatusChip';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/apiError';

export default function OrdersPage() {
  const [page, setPage] = useState({ content: [], totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    orderApi
      .list({ page: pageNumber, size: 10 })
      .then(({ data }) => setPage(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load your orders')))
      .finally(() => setLoading(false));
  }, [pageNumber]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (page.content.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <ReceiptLongOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 1 }}>
          No orders yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Once you place an order, it'll show up here.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" size="large">
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        My Orders
      </Typography>

      <Stack spacing={2}>
        {page.content.map((order) => (
          <Paper
            key={order.id}
            component={RouterLink}
            to={`/orders/${order.id}`}
            variant="outlined"
            sx={{ p: 2.5, display: 'block', color: 'inherit' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography fontWeight={700} sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  {order.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(order.placedAt)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <OrderStatusChip status={order.status} />
                <Typography fontWeight={700}>{formatCurrency(order.totalAmount)}</Typography>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {page.totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination count={page.totalPages} page={pageNumber + 1} onChange={(_e, v) => setPageNumber(v - 1)} />
        </Stack>
      )}
    </Container>
  );
}