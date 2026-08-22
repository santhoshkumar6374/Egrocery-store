import { API_BASE_URL } from '../api/axiosClient';

/** Backend product/category images come back as relative paths like "/uploads/products/x.jpg". */
export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}

export function formatCurrency(amount) {
  const value = Number(amount ?? 0);
  return `\u20B9${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUnit(unit, weightValue) {
  if (!unit) return '';
  const label = { KG: 'kg', GRAM: 'g', LITER: 'L', ML: 'ml', PACKET: 'packet', PIECE: 'pc' }[unit] || unit.toLowerCase();
  return weightValue ? `${weightValue} ${label}` : label;
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const ORDER_STATUS_LABELS = {
  PLACED: 'Order Placed',
  ACCEPTED: 'Accepted',
  PACKED: 'Packed',
  READY_FOR_PICKUP: 'Ready for Pickup',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};