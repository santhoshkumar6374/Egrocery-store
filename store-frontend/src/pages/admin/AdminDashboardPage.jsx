import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import { adminDashboardApi } from '../../api/adminDashboardApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/apiError';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi
      .getSummary()
      .then(({ data }) => setSummary(data.data))
      .catch((err) =>
        setError(
          getApiErrorMessage(err, 'Could not load dashboard data')
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const cards = summary
    ? [
        {
          label: "Today's Sales",
          value: formatCurrency(summary.todaySales),
          icon: TodayOutlinedIcon,
          bg: 'linear-gradient(135deg, #eef4ff 0%, #e0ebff 100%)',
          iconBg: '#2563eb',
          iconColor: '#ffffff',
        },
        {
          label: 'Monthly Sales',
          value: formatCurrency(summary.monthlySales),
          icon: CalendarMonthOutlinedIcon,
          bg: 'linear-gradient(135deg, #f5f0ff 0%, #ebe2ff 100%)',
          iconBg: '#7c3aed',
          iconColor: '#ffffff',
        },
        {
          label: 'Total Revenue',
          value: formatCurrency(summary.totalRevenue),
          icon: AccountBalanceWalletOutlinedIcon,
          bg: 'linear-gradient(135deg, #ecfdf5 0%, #d8f8e9 100%)',
          iconBg: '#059669',
          iconColor: '#ffffff',
        },
        {
          label: 'Total Orders',
          value: summary.totalOrders,
          icon: ReceiptLongOutlinedIcon,
          bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          iconBg: '#ea580c',
          iconColor: '#ffffff',
        },
        {
          label: 'Pending Orders',
          value: summary.pendingOrders,
          icon: PendingActionsOutlinedIcon,
          bg: 'linear-gradient(135deg, #fffaf0 0%, #fef3c7 100%)',
          iconBg: '#d97706',
          iconColor: '#ffffff',
        },
        {
          label: 'Delivered Orders',
          value: summary.deliveredOrders,
          icon: CheckCircleOutlineIcon,
          bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          iconBg: '#16a34a',
          iconColor: '#ffffff',
        },
        {
          label: 'Total Customers',
          value: summary.totalCustomers,
          icon: PeopleAltOutlinedIcon,
          bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          iconBg: '#0284c7',
          iconColor: '#ffffff',
        },
        {
          label: 'Total Products',
          value: summary.totalProducts,
          icon: Inventory2OutlinedIcon,
          bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          iconBg: '#9333ea',
          iconColor: '#ffffff',
        },
      ]
    : [];

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: '#f8fafc',
        p: { xs: 1, sm: 2, md: 3 },
        borderRadius: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          background:
            'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          border: '1px solid',
          borderColor: '#e8edf5',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#172033',
            letterSpacing: '-0.5px',
            fontSize: { xs: '1.7rem', sm: '2rem', md: '2.25rem' },
          }}
        >
          Welcome, {user?.name}
        </Typography>

        <Typography
          sx={{
            mt: 0.7,
            color: '#64748b',
            fontSize: '0.98rem',
          }}
        >
          Here's how the shop is doing.
        </Typography>
      </Box>

      {/* Loading */}
      {loading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: '1px solid #e8edf5',
            background: '#ffffff',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={42}
              thickness={4}
              sx={{ color: '#2563eb' }}
            />

            <Typography
              sx={{
                mt: 2,
                color: '#64748b',
                fontSize: '0.9rem',
              }}
            >
              Loading dashboard...
            </Typography>
          </Box>
        </Paper>
      ) : error ? (
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            py: 1.5,
          }}
        >
          {error}
        </Alert>
      ) : (
        <Grid container spacing={2.5}>
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Grid
                key={card.label}
                size={{ xs: 12, sm: 6, md: 3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: 175,
                    p: 2.7,
                    borderRadius: 4,
                    background: card.bg,
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow:
                      '0 8px 25px rgba(15, 23, 42, 0.06)',
                    transition:
                      'transform 0.25s ease, box-shadow 0.25s ease',

                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow:
                        '0 15px 35px rgba(15, 23, 42, 0.11)',
                    },

                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.35)',
                      right: -35,
                      bottom: -40,
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: card.iconBg,
                      color: card.iconColor,
                      mb: 2.2,
                      boxShadow:
                        '0 7px 16px rgba(15, 23, 42, 0.12)',
                    }}
                  >
                    <Icon sx={{ fontSize: 25 }} />
                  </Box>

                  {/* Label */}
                  <Typography
                    sx={{
                      color: '#64748b',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      mb: 0.6,
                    }}
                  >
                    {card.label}
                  </Typography>

                  {/* Value */}
                  <Typography
                    sx={{
                      color: '#172033',
                      fontSize: {
                        xs: '1.55rem',
                        sm: '1.65rem',
                        md: '1.75rem',
                      },
                      fontWeight: 800,
                      lineHeight: 1.2,
                      letterSpacing: '-0.4px',
                    }}
                  >
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}