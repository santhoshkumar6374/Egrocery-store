import { Chip } from '@mui/material';
import { ORDER_STATUS_LABELS } from '../../utils/formatters';

const COLOR_BY_STATUS = {
  PLACED: 'default',
  ACCEPTED: 'info',
  PACKED: 'info',
  READY_FOR_PICKUP: 'warning',
  OUT_FOR_DELIVERY: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export default function OrderStatusChip({ status, size = 'small' }) {
  return (
    <Chip
      label={ORDER_STATUS_LABELS[status] ?? status}
      color={COLOR_BY_STATUS[status] ?? 'default'}
      size={size}
      sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: size === 'small' ? 11 : 13 }}
    />
  );
}