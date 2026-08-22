import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Alert } from '@mui/material';
import { adminPaymentApi } from '../../../api/adminPaymentApi';
import { getApiErrorMessage } from '../../../utils/apiError';

const STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

export default function MarkPaymentStatusDialog({ open, payment, onClose, onSaved }) {
  const [status, setStatus] = useState('SUCCESS');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setStatus('SUCCESS');
    setNote('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminPaymentApi.updateStatus(payment.id, { status, note: note || undefined });
      onSaved();
      handleClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update this payment'));
    } finally {
      setSaving(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update payment — {payment.orderNumber}</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Update'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}