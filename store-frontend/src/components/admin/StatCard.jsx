import { Paper, Typography, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = '#075e3f',
  bgGradient = 'linear-gradient(135deg, #e8f5ee 0%, #d3ede0 100%)',
  trend,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.8,
        height: '100%',
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
          borderColor: accent,
        },
      }}
    >
      {/* TOP ROW: LABEL & ICON BADGE */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </Typography>

        {Icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              background: bgGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
        )}
      </Box>

      {/* VALUE */}
      <Typography
        sx={{
          fontFamily: '"Fraunces", serif',
          fontWeight: 800,
          fontSize: { xs: '1.75rem', sm: '2.1rem' },
          lineHeight: 1.1,
          color: '#1a2e24',
        }}
      >
        {value}
      </Typography>

      {/* TREND BADGE */}
      {trend && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            size="small"
            icon={<TrendingUpIcon sx={{ fontSize: '14px !important' }} />}
            label={trend}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: '#eaf6ef',
              color: '#075e3f',
              borderRadius: 1.5,
              '& .MuiChip-icon': {
                color: '#075e3f',
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}