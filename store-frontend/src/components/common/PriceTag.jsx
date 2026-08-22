import { Box, Typography, Stack } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

/**
 * The app's signature motif: a die-cut price tag (CSS clip-path notch + string
 * hole) rendered wherever a price appears — product cards, product detail,
 * cart lines, order summaries. Keeps the "one bold element" rule from the
 * design plan: everywhere else stays quiet, this is the one recurring flourish.
 */
export default function PriceTag({ price, mrp, showMrp = true, size = 'medium' }) {
  const isLarge = size === 'large';
  const hasDiscount = showMrp && mrp && Number(mrp) > Number(price);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        pl: isLarge ? 2.75 : 2.25,
        pr: isLarge ? 2 : 1.5,
        py: isLarge ? 1 : 0.55,
        bgcolor: 'secondary.main',
        color: '#fff',
        clipPath: 'polygon(14px 0%, 100% 0%, 100% 100%, 14px 100%, 0% 50%)',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: 5,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.7)',
        }}
      />
      <Stack direction="row" alignItems="baseline" spacing={0.75}>
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 700,
            fontSize: isLarge ? '1.75rem' : '1.05rem',
            lineHeight: 1,
          }}
        >
          {formatCurrency(price)}
        </Typography>
        {hasDiscount && (
          <Typography
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: isLarge ? '0.85rem' : '0.68rem',
              textDecoration: 'line-through',
              opacity: 0.8,
            }}
          >
            {formatCurrency(mrp)}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}