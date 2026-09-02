import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';

import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

import { productApi, categoryApi } from '../api/productApi';
import ProductCard from '../components/customer/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/apiError';
import {
  SHOP_NAME,
  SHOP_ADDRESS,
  SHOP_COORDINATES,
  SHOP_PHONE,
  SHOP_HOURS,
} from '../utils/constants';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hero search bar input state
  const [heroQuery, setHeroQuery] = useState('');

  // Load categories on mount
  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products when filters change or component mounts
  useEffect(() => {
    setLoading(true);
    setError('');

    productApi
      .search({
        keyword: searchKeyword || undefined,
        categoryId: selectedCategory || undefined,
        inStockOnly: inStockOnly || undefined,
        page: 0,
        size: 12,
      })
      .then(({ data }) => {
        setProducts(data?.data?.content || []);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Could not load products'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategory, searchKeyword, inStockOnly]);

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(heroQuery.trim())}`);
    }
  };

  const handleHeroCategoryClick = (catName) => {
    const matched = categories.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase(),
    );
    if (matched) {
      setSelectedCategory(String(matched.id));
    }
    const elem = document.getElementById('homepage-products-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ bgcolor: '#f7faf8', minHeight: '100vh' }}>
      {/* =========================================================
          1. HERO SECTION WITH SEARCH & DEPARTMENTS
      ========================================================= */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #043d27 0%, #075e3f 45%, #0aa36f 100%)',
          color: '#fff',
          pt: { xs: 8, md: 11 },
          pb: { xs: 10, md: 14 },
        }}
      >
        {/* Ambient Glow Orbs */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            top: -180,
            right: -100,
            filter: 'blur(40px)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,193,7,0.08)',
            bottom: -160,
            left: -80,
            filter: 'blur(30px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            {/* LEFT SIDE HERO CONTENT */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<VerifiedOutlinedIcon sx={{ color: '#ffd166 !important', fontSize: 16 }} />}
                  label={
                    isAuthenticated
                      ? `Welcome back, ${user?.name?.split(' ')[0]}`
                      : 'FRESH GROCERIES • FAST DELIVERY'
                  }
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#ffd166',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontSize: 12,
                    backdropFilter: 'blur(6px)',
                  }}
                />
              </Stack>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: {
                    xs: '2.6rem',
                    sm: '3.6rem',
                    md: '4.6rem',
                  },
                  lineHeight: 1.05,
                  mt: 2.5,
                  maxWidth: 720,
                  letterSpacing: '-0.02em',
                }}
              >
                Everyday groceries,
                <Box component="span" sx={{ color: '#ffd166' }}>
                  {' '}
                  made simple.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 580,
                  fontSize: { xs: 16, md: 19 },
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                Shop fresh vegetables, rice, grains, dairy, and household essentials from {SHOP_NAME}. Order online for fast home delivery or easy store pickup.
              </Typography>

              {/* HERO SEARCH BAR */}
              <Paper
                component="form"
                onSubmit={handleHeroSearchSubmit}
                elevation={0}
                sx={{
                  mt: 4,
                  p: { xs: 0.5, sm: 0.8 },
                  borderRadius: { xs: 3, sm: 50 },
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: { xs: 1, sm: 0 },
                  maxWidth: 540,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Search for rice, oils, milk, vegetables..."
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: { xs: 1.5, sm: 2 } }}>
                          <SearchOutlinedIcon sx={{ color: '#075e3f' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    px: 1,
                    py: { xs: 0.5, sm: 0 },
                    '& input': {
                      fontSize: { xs: 14, sm: 15 },
                      fontWeight: 500,
                      color: '#1a2e24',
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    px: { xs: 3, sm: 3.5 },
                    py: { xs: 1, sm: 1.2 },
                    borderRadius: { xs: 2.5, sm: 50 },
                    fontWeight: 800,
                    bgcolor: '#075e3f',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#064e34',
                    },
                  }}
                >
                  Search
                </Button>
              </Paper>

              {/* ACTION BUTTONS */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 3.5 }}
              >
                <Button
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  size="large"
                  disableElevation
                  endIcon={<ArrowForwardOutlinedIcon />}
                  sx={{
                    px: { xs: 3.5, sm: 4.5 },
                    py: 1.6,
                    borderRadius: 50,
                    bgcolor: '#ffd166',
                    color: '#173b2b',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    boxShadow: '0 8px 24px rgba(255, 209, 102, 0.35)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#ffca4f',
                      boxShadow: '0 12px 28px rgba(255, 209, 102, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Start Shopping
                </Button>

                {!isAuthenticated && (
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: { xs: 3, sm: 4 },
                      py: 1.6,
                      borderRadius: 50,
                      borderColor: 'rgba(255,255,255,0.6)',
                      color: '#fff',
                      fontWeight: 700,
                      '&:hover': {
                        borderColor: '#fff',
                        bgcolor: 'rgba(255,255,255,0.08)',
                      },
                    }}
                  >
                    Create Account
                  </Button>
                )}
              </Stack>
            </Grid>

            {/* RIGHT SIDE FEATURE DEPARTMENTS CARD */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5, md: 4 },
                  borderRadius: 5,
                  bgcolor: '#ffffff',
                  color: '#173b2b',
                  boxShadow: '0 25px 70px rgba(0,0,0,0.22)',
                  transform: { md: 'rotate(2deg)' },
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: { md: 'rotate(0deg) scale(1.02)' },
                  },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    letterSpacing: 2,
                  }}
                >
                  STORE DEPARTMENTS
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                    mb: 3,
                  }}
                >
                  Everything you need 🛒
                </Typography>

                {[
                  ['🥦', 'Fresh Vegetables', 'Fresh & farm picked'],
                  ['🍚', 'Rice & Grains', 'Daily essentials & pulses'],
                  ['🥛', 'Dairy Products', 'Quality milk & curd'],
                  ['🧴', 'Household Items', 'Cleaners & care'],
                ].map(([emoji, title, subtitle]) => (
                  <Box
                    key={title}
                    onClick={() => handleHeroCategoryClick(title)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.6,
                      mb: 1.2,
                      borderRadius: 3.5,
                      cursor: 'pointer',
                      bgcolor: '#f9fbf9',
                      border: '1px solid #edf2ee',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        bgcolor: '#e8f5ee',
                        borderColor: 'primary.light',
                        transform: 'translateX(6px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: '#edf7f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}
                    >
                      {emoji}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} fontSize={15}>
                        {title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subtitle}
                      </Typography>
                    </Box>

                    <Typography color="primary.main" fontWeight={800}>
                      →
                    </Typography>
                  </Box>
                ))}

                <Button
                  component={RouterLink}
                  to="/products"
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowForwardOutlinedIcon />}
                  sx={{
                    mt: 2.5,
                    py: 1.6,
                    borderRadius: 3,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    background:
                      'linear-gradient(135deg, #075e3f 0%, #0aa36f 100%)',
                    boxShadow: '0 6px 18px rgba(7, 94, 63, 0.25)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #064e34 0%, #088a5e 100%)',
                    },
                  }}
                >
                  Browse Full Catalog
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          2. PRODUCTS SECTION (IMMEDIATELY DISPLAYED ON HOMEPAGE)
      ========================================================= */}
      <Container
        id="homepage-products-section"
        maxWidth="lg"
        sx={{
          mt: { xs: 6, md: 8 },
          mb: { xs: 8, md: 10 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '0.15em',
              }}
            >
              OUR STORE PRODUCTS
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
                lineHeight: 1.15,
                mt: 0.5,
              }}
            >
              Fresh Products for You
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.8, fontSize: 16 }}>
              Choose from fresh produce, grains, dairy, and household essentials.
            </Typography>
          </Box>
        </Stack>

        {/* SEARCH & FILTER BAR */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: '#e2e8e4',
            bgcolor: '#ffffff',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* SEARCH INPUT */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Filter homepage products by name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Grid>

            {/* IN STOCK TOGGLE */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                direction="row"
                justifyContent={{ xs: 'space-between', md: 'flex-end' }}
                alignItems="center"
                spacing={2}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      In stock only
                    </Typography>
                  }
                />

                {(selectedCategory || searchKeyword || inStockOnly) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchKeyword('');
                      setInStockOnly(false);
                    }}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* CATEGORY FILTER CHIPS */}
        {categories.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 4,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Chip
              label="All Products"
              onClick={() => setSelectedCategory('')}
              color={!selectedCategory ? 'primary' : 'default'}
              variant={!selectedCategory ? 'filled' : 'outlined'}
              sx={{
                height: 38,
                borderRadius: 2.5,
                fontWeight: 700,
                px: 1,
                cursor: 'pointer',
              }}
            />

            {categories.map((cat) => {
              const isSelected = selectedCategory === String(cat.id);
              return (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  onClick={() => setSelectedCategory(String(cat.id))}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    height: 38,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    px: 1,
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Stack>
        )}

        {/* LOADING STATE */}
        {loading && (
          <Box
            sx={{
              py: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={42} color="primary" />
              <Typography color="text.secondary" fontWeight={600}>
                Loading fresh products...
              </Typography>
            </Stack>
          </Box>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 3.5,
              border: '1px solid #ffcdd2',
              bgcolor: '#fff8f8',
            }}
          >
            <Typography variant="h6" color="error" fontWeight={700}>
              Unable to load products
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setSelectedCategory(selectedCategory)}
              sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
            >
              Try Again
            </Button>
          </Paper>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && products.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              py: 8,
              px: 3,
              textAlign: 'center',
              borderRadius: 3.5,
              border: '1px solid #e1e7e3',
              bgcolor: '#ffffff',
            }}
          >
            <Typography sx={{ fontSize: 44, mb: 1 }}>🛒</Typography>
            <Typography variant="h6" fontWeight={700}>
              No products found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              No products available matching your active search or category filters.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCategory('');
                setSearchKeyword('');
                setInStockOnly(false);
              }}
              sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
            >
              Reset Filters
            </Button>
          </Paper>
        )}

        {/* PRODUCT GRID */}
        {!loading && !error && products.length > 0 && (
          <>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {products.map((product) => (
                <Grid key={product.id} size={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>

            {/* BOTTOM EXPLORE CATALOG CTA */}
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/products"
                size="large"
                endIcon={<ArrowForwardOutlinedIcon />}
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: 1.8,
                  borderRadius: 50,
                  fontWeight: 800,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  color: '#173b2b',
                  background:
                    'linear-gradient(135deg, #ffd166 0%, #ffca4f 100%)',
                  boxShadow: '0 10px 28px rgba(255, 209, 102, 0.45)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #ffc947 0%, #ffb703 100%)',
                    boxShadow: '0 14px 34px rgba(255, 183, 3, 0.55)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                Explore Full Catalog & Special Offers 🛒
              </Button>
            </Box>
          </>
        )}
      </Container>

      {/* =========================================================
          3. SHOPPING SERVICES & FEATURES HIGHLIGHT
      ========================================================= */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          Shop the way you like
        </Typography>

        <Typography align="center" color="text.secondary" sx={{ mb: 5 }}>
          Simple, convenient, and reliable grocery shopping for your family.
        </Typography>

        <Grid container spacing={3}>
          {/* PACK ORDER */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4.5 },
                height: '100%',
                borderRadius: 4,
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: '#e2e8e4',
                transition: '0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 18px 45px rgba(0,0,0,0.08)',
                  borderColor: 'primary.light',
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3.5,
                  bgcolor: '#e8f5ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <StorefrontOutlinedIcon
                  sx={{
                    fontSize: 34,
                    color: 'primary.main',
                  }}
                />
              </Box>

              <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
                Pack My Order (Free Store Pickup)
              </Typography>

              <Typography color="text.secondary" sx={{ lineHeight: 1.7, fontSize: 15 }}>
                Place your order online and our team will carefully pack everything ready for quick pickup. Visit the store and collect your groceries whenever convenient.
              </Typography>

              <Chip
                label="Zero Delivery Fee"
                size="small"
                color="primary"
                sx={{ mt: 2.5, fontWeight: 700, borderRadius: 1.5 }}
              />
            </Paper>
          </Grid>

          {/* HOME DELIVERY */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4.5 },
                height: '100%',
                borderRadius: 4,
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: '#e2e8e4',
                transition: '0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 18px 45px rgba(0,0,0,0.08)',
                  borderColor: 'secondary.light',
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3.5,
                  bgcolor: '#fff4d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <LocalShippingOutlinedIcon
                  sx={{
                    fontSize: 34,
                    color: 'secondary.main',
                  }}
                />
              </Box>

              <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
                Fast Home Delivery
              </Typography>

              <Typography color="text.secondary" sx={{ lineHeight: 1.7, fontSize: 15 }}>
                Enter your location at checkout to calculate your delivery charge and estimated arrival time. Fresh groceries delivered right to your doorstep.
              </Typography>

              <Chip
                label="Direct Doorstep Delivery"
                size="small"
                color="secondary"
                sx={{ mt: 2.5, fontWeight: 700, borderRadius: 1.5 }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* =========================================================
          4. STORE LOCATION & OPERATING HOURS CARD
      ========================================================= */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: '#e2e8e4',
            boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={800}
                letterSpacing={1.5}
              >
                STORE LOCATION & CONTACT
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 2 }}>
                Visit {SHOP_NAME} in Tiruppur
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mb: 3.5, lineHeight: 1.7, fontSize: 16 }}
              >
                Located in Dhanalakshmi Nagar, Iduvampalayam, Tiruppur. Visit us for in-store shopping or collect your pre-packed online orders at our pickup counter.
              </Typography>

              <Stack spacing={2.5} sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: '#e8f5ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <PlaceOutlinedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography fontWeight={800}>Address</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {SHOP_ADDRESS} (Coordinates: {SHOP_COORDINATES.lat},{' '}
                      {SHOP_COORDINATES.lng})
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: '#fff4d8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'secondary.main',
                      flexShrink: 0,
                    }}
                  >
                    <AccessTimeOutlinedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography fontWeight={800}>Store Hours & Phone</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {SHOP_HOURS} • Phone: {SHOP_PHONE}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Button
                component="a"
                href={`https://www.google.com/maps/search/?api=1&query=${SHOP_COORDINATES.lat},${SHOP_COORDINATES.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
                startIcon={<PlaceOutlinedIcon />}
                sx={{ borderRadius: 50, fontWeight: 700, px: 3.5, py: 1.2 }}
              >
                View Location on Google Maps ↗
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 4,
                  bgcolor: '#eaf6ef',
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h1" sx={{ fontSize: 68, mb: 1 }}>
                  🏪
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {SHOP_NAME}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.8, maxWidth: 300 }}
                >
                  Dhanalakshmi Nagar, Iduvampalayam, Tiruppur, Tamil Nadu - 631687
                </Typography>
                <Chip
                  label="Pickup & Delivery Available"
                  color="primary"
                  size="small"
                  sx={{ mt: 2, fontWeight: 700, borderRadius: 1.5 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}