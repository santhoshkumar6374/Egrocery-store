import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Typography,
} from '@mui/material';
import { adminInventoryApi } from '../../../api/adminInventoryApi';
import { getApiErrorMessage } from '../../../utils/apiError';

const CHANGE_TYPES = [
  { value: 'STOCK_IN', label: 'Stock In (received from supplier)' },
  { value: 'RETURN', label: 'Return (added back to stock)' },
  { value: 'STOCK_OUT', label: 'Stock Out (damage, expiry, etc.)' },
  { value: 'SALE', label: 'Sale (manual deduction)' },
  { value: 'ADJUSTMENT', label: 'Adjustment (set exact counted quantity)' },
];

export default function StockUpdateDialog({ open, item, onClose, onSaved }) {
  const [changeType, setChangeType] = useState('STOCK_IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setChangeType('STOCK_IN');
    setQuantity('');
    setReason('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminInventoryApi.updateStock(item.productId, {
        changeType,
        quantity: Number(quantity),
        reason: reason || undefined,
      });
      onSaved();
      handleClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update stock'));
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update stock — {item.productName}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current stock: <strong>{item.currentStock}</strong>
          </Typography>
          <Stack spacing={2.5}>
            <TextField select label="Change type" value={changeType} onChange={(e) => setChangeType(e.target.value)} fullWidth>
              {CHANGE_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={changeType === 'ADJUSTMENT' ? 'New exact quantity' : 'Quantity'}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { min: changeType === 'ADJUSTMENT' ? 0 : 1 } }}
            />
            <TextField
              label="Reason / note (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || !quantity}>
            {saving ? 'Saving…' : 'Update Stock'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}