import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, Stack, Grid, Divider, Button } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TopNav from '../TopNav';
import {
  SHOP_NAME,
  SHOP_ADDRESS,
  SHOP_COORDINATES,
  SHOP_PHONE,
  SHOP_EMAIL,
  SHOP_HOURS,
} from '../../utils/constants';

export default function StorefrontLayout() {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${SHOP_COORDINATES.lat},${SHOP_COORDINATES.lng}`;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav />

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ bgcolor: '#1A331E', color: '#F3EFE4', mt: 8, pt: 6, pb: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Column 1: Shop Branding */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <ShoppingBasketOutlinedIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: '#FFFFFF' }}>
                  {SHOP_NAME}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6, pr: { md: 2 } }}>
                Your trusted local grocery store. Farm-fresh produce, everyday essentials, and quality organic groceries — packed with care for pickup or fast home delivery.
              </Typography>
            </Grid>

            {/* Column 2: Shop Location */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#FFFFFF', mb: 2 }}>
                Store Location
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <LocationOnOutlinedIcon sx={{ color: 'secondary.main', fontSize: 22, mt: 0.3 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {SHOP_ADDRESS}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                      Lat: {SHOP_COORDINATES.lat}, Long: {SHOP_COORDINATES.lng}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component="a"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  sx={{
                    color: 'secondary.main',
                    borderColor: 'secondary.main',
                    alignSelf: 'flex-start',
                    mt: 1,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'secondary.main' },
                  }}
                >
                  View on Google Maps
                </Button>
              </Stack>
            </Grid>

            {/* Column 3: Contact & Operating Hours */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#FFFFFF', mb: 2 }}>
                Contact & Store Hours
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PhoneOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {SHOP_PHONE}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmailOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {SHOP_EMAIL}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <AccessTimeOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {SHOP_HOURS}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              &copy; {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}