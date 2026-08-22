import { Chip } from '@mui/material';

export default function StockChip({ inStock, stockQuantity }) {
  if (!inStock) {
    return <Chip label="Out of stock" size="small" color="error" variant="outlined" />;
  }
  if (typeof stockQuantity === 'number' && stockQuantity <= 10) {
    return <Chip label={`Only ${stockQuantity} left`} size="small" color="warning" variant="outlined" />;
  }
  return <Chip label="In stock" size="small" color="success" variant="outlined" />;
}