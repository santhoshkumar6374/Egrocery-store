import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Pagination,
  Box,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
  Paper,
  Button,
  Divider,
} from '@mui/material';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

import { productApi, categoryApi } from '../../api/productApi';
import ProductCard from '../../components/customer/ProductCard';
import { getApiErrorMessage } from '../../utils/apiError';

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'PRICE_LOW_HIGH', label: 'Price: Low to High' },
  { value: 'PRICE_HIGH_LOW', label: 'Price: High to Low' },
  { value: 'DISCOUNT_HIGH_LOW', label: 'Biggest Discount' },
];

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [keywordInput, setKeywordInput] = useState(
    searchParams.get('keyword') ?? '',
  );

  const keyword = searchParams.get('keyword') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const inStockOnly =
    searchParams.get('inStockOnly') === 'true';

  const pageNumber = Number(
    searchParams.get('page') ?? 0,
  );

  /* =========================
     LOAD CATEGORIES
  ========================= */
  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]));
  }, []);

  /* =========================
     URL PARAMETERS
  ========================= */
  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === '' ||
          value === null ||
          value === undefined ||
          value === false
        ) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      if (!('page' in updates)) {
        next.delete('page');
      }

      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  /* =========================
     LOAD PRODUCTS
  ========================= */
  useEffect(() => {
    setLoading(true);
    setError('');

    productApi
      .search({
        keyword: keyword || undefined,
        categoryId: categoryId || undefined,
        sort: sort || undefined,
        inStockOnly: inStockOnly || undefined,
        page: pageNumber,
        size: PAGE_SIZE,
      })
      .then(({ data }) => setPage(data.data))
      .catch((err) =>
        setError(
          getApiErrorMessage(
            err,
            'Could not load products',
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, [
    keyword,
    categoryId,
    sort,
    inStockOnly,
    pageNumber,
  ]);

  /* =========================
     SEARCH
  ========================= */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({
      keyword: keywordInput,
    });
  };

  /* =========================
     CLEAR FILTERS
  ========================= */
  const clearFilters = () => {
    setKeywordInput('');
    setSearchParams({});
  };

  const hasFilters =
    keyword ||
    categoryId ||
    sort ||
    inStockOnly;

  return (
    <Box
      sx={{
        bgcolor: '#f7f9f8',
        minHeight: '100vh',
        pb: 10,
      }}
    >
      {/* =====================================
          HEADER
      ====================================== */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #075e3f 0%, #087f5b 55%, #0aa36f 100%)',
          color: '#fff',
          pt: { xs: 5, md: 7 },
          pb: { xs: 9, md: 11 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              color: '#ffd166',
              fontWeight: 700,
              letterSpacing: '0.15em',
            }}
          >
            FRESH • QUALITY • CONVENIENT
          </Typography>

          <Typography
            variant="h2"
            sx={{
              mt: 1,
              fontWeight: 800,
              fontSize: {
                xs: '2.3rem',
                sm: '3rem',
                md: '3.7rem',
              },
              lineHeight: 1.1,
            }}
          >
            Shop the Aisles
          </Typography>

          <Typography
            sx={{
              mt: 2,
              maxWidth: 600,
              fontSize: { xs: 15, md: 17 },
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            Find everything you need for your kitchen and
            home. Fresh groceries, everyday essentials and
            more.
          </Typography>
        </Container>
      </Box>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: -6, md: -7 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* =====================================
            SEARCH
        ====================================== */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#e1e7e3',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.08)',
            bgcolor: '#fff',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
          >
            <TextField
              fullWidth
              placeholder="Search for rice, oils, vegetables..."
              value={keywordInput}
              onChange={(e) =>
                setKeywordInput(e.target.value)
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 54,
                  borderRadius: 2.5,
                  bgcolor: '#fafcfb',
                  fontSize: 16,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon
                        sx={{
                          color: 'primary.main',
                          mr: 0.5,
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Paper>

        {/* =====================================
            CATEGORIES
        ====================================== */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#e1e7e3',
            bgcolor: '#fff',
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 17,
              mb: 2,
            }}
          >
            Categories
          </Typography>

          <Stack
            direction="row"
            sx={{
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
              overflowX: { xs: 'auto', sm: 'visible' },
              py: { xs: 0.5, sm: 0 },
              pb: { xs: 1, sm: 0 },
              gap: 1.2,
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <Chip
              label="All Categories"
              onClick={() =>
                updateParams({
                  categoryId: '',
                })
              }
              color={
                !categoryId
                  ? 'primary'
                  : 'default'
              }
              variant={
                !categoryId
                  ? 'filled'
                  : 'outlined'
              }
              sx={{
                height: 38,
                borderRadius: 2,
                fontWeight: 600,
                px: 0.5,
                flexShrink: 0,
              }}
            />

            {categories.map((category) => {
              const selected =
                categoryId === String(category.id);

              return (
                <Chip
                  key={category.id}
                  label={category.name}
                  onClick={() =>
                    updateParams({
                      categoryId: String(
                        category.id,
                      ),
                    })
                  }
                  color={
                    selected
                      ? 'primary'
                      : 'default'
                  }
                  variant={
                    selected
                      ? 'filled'
                      : 'outlined'
                  }
                  sx={{
                    height: 38,
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 0.5,
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </Stack>
        </Paper>

        {/* =====================================
            FILTER BAR
        ====================================== */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#e1e7e3',
            bgcolor: '#fff',
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={2}
            alignItems={{
              xs: 'stretch',
              sm: 'center',
            }}
          >
            {/* SORT */}
            <TextField
              select
              size="small"
              label="Sort by"
              value={sort}
              onChange={(e) =>
                updateParams({
                  sort: e.target.value,
                })
              }
              sx={{
                width: {
                  xs: '100%',
                  sm: 220,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* STOCK */}
            <Box
              sx={{
                px: { xs: 0, sm: 1 },
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={inStockOnly}
                    onChange={(e) =>
                      updateParams({
                        inStockOnly:
                          e.target.checked,
                      })
                    }
                  />
                }
                label="In stock only"
              />
            </Box>

            {/* RIGHT SIDE */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: {
                  xs: 'space-between',
                  sm: 'flex-end',
                },
                alignItems: 'center',
                gap: 2,
              }}
            >
              {page.totalElements > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <strong>
                    {page.totalElements}
                  </strong>{' '}
                  product
                  {page.totalElements === 1
                    ? ''
                    : 's'}
                </Typography>
              )}

              {hasFilters && (
                <Button
                  size="small"
                  onClick={clearFilters}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* =====================================
            PRODUCTS TITLE
        ====================================== */}
        {!loading &&
          !error &&
          page.content.length > 0 && (
            <Box sx={{ mt: 5, mb: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Products
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Choose from our available
                    products
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Page {pageNumber + 1} of{' '}
                  {page.totalPages}
                </Typography>
              </Stack>

              <Divider sx={{ mt: 2.5 }} />
            </Box>
          )}

        {/* =====================================
            LOADING
        ====================================== */}
        {loading && (
          <Box
            sx={{
              minHeight: 350,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack
              alignItems="center"
              spacing={2}
            >
              <CircularProgress size={42} />

              <Typography
                color="text.secondary"
              >
                Loading products...
              </Typography>
            </Stack>
          </Box>
        )}

        {/* =====================================
            ERROR
        ====================================== */}
        {!loading && error && (
          <Paper
            elevation={0}
            sx={{
              mt: 5,
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#ffcdd2',
            }}
          >
            <Typography
              variant="h6"
              color="error"
              fontWeight={700}
            >
              Unable to load products
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 3,
              }}
            >
              {error}
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                window.location.reload()
              }
              sx={{
                borderRadius: 2,
                px: 4,
              }}
            >
              Try Again
            </Button>
          </Paper>
        )}

        {/* =====================================
            EMPTY
        ====================================== */}
        {!loading &&
          !error &&
          page.content.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                mt: 5,
                py: 10,
                px: 3,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid',
                borderColor: '#e1e7e3',
              }}
            >
              <Typography
                sx={{
                  fontSize: 50,
                  mb: 2,
                }}
              >
                🛒
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
              >
                No products found
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  mb: 3,
                }}
              >
                Try a different keyword or remove
                your filters.
              </Typography>

              <Button
                variant="contained"
                onClick={clearFilters}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                }}
              >
                View All Products
              </Button>
            </Paper>
          )}

        {/* =====================================
            PRODUCT GRID
        ====================================== */}
        {!loading &&
          !error &&
          page.content.length > 0 && (
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
            >
              {page.content.map((product) => (
                <Grid
                  key={product.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      transition:
                        'transform 0.2s ease',
                      '&:hover': {
                        transform:
                          'translateY(-5px)',
                      },
                    }}
                  >
                    <ProductCard
                      product={product}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

        {/* =====================================
            PAGINATION
        ====================================== */}
        {!loading &&
          !error &&
          page.content.length > 0 &&
          page.totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 7,
                pt: 4,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Pagination
                count={page.totalPages}
                page={pageNumber + 1}
                onChange={(_event, value) =>
                  updateParams({
                    page: String(value - 1),
                  })
                }
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          )}
      </Container>
    </Box>
  );
}