import { Stack, TextField } from '@mui/material';

export default function DateRangeFields({ from, to, onFromChange, onToChange, extra }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 3 }}>
      <TextField
        label="From"
        type="date"
        size="small"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      {extra}
    </Stack>
  );
}