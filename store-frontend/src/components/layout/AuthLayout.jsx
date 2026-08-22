import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Stack } from '@mui/material';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import { SHOP_NAME } from '../../utils/constants';

/**
 * Split-screen "shopfront" frame for Login/Register: a deep-awning-green panel
 * carrying the brand, and a warm paper-white panel holding the form itself.
 */
export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '42%',
          minWidth: 380,
          bgcolor: 'primary.main',
          color: '#FFFFFF',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ zIndex: 1, color: 'inherit' }}
        >
          <ShoppingBasketOutlinedIcon />
          <Typography variant="h5" fontWeight={700}>
            {SHOP_NAME}
          </Typography>
        </Stack>

        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontSize: { md: '2.6rem' }, mb: 2, maxWidth: 420 }}>
            The neighborhood shop, now in your pocket.
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 380 }}>
            Fresh produce, pantry staples, and same-day delivery — pick it up yourself, or have it
            brought to your door.
          </Typography>
        </Box>

        {/* Crate-stack signature: a few overlapping kraft-toned blocks, kept quiet and geometric */}
        <Box sx={{ position: 'absolute', right: -60, bottom: -40, opacity: 0.9 }} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 190,
                height: 130,
                bgcolor: '#E8DCC4',
                border: '3px solid #D8C8A4',
                borderRadius: 2,
                right: i * 46,
                bottom: i * 20,
                transform: `rotate(${(i - 1) * 4}deg)`,
                opacity: 0.16,
              }}
            />
          ))}
        </Box>

        <Box className="awning-stripe" sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, opacity: 0.5 }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}