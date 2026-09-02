import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
  Rating,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import PriceTag from '../../components/common/PriceTag';
import StockChip from '../../components/common/StockChip';
import ProductCard from '../../components/customer/ProductCard';
import { resolveImageUrl, formatUnit, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isCustomer } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ content: [], totalElements: 0 });
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadReviewsAndSummary = async () => {
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        productApi.getReviews(id, { page: 0, size: 10 }),
        productApi.getReviewSummary(id),
      ]);
      setReviews(reviewsRes.data.data || { content: [] });
      setSummary(summaryRes.data.data || { averageRating: 0, totalReviews: 0 });
    } catch {
      // best effort refresh
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    setQuantity(1);
    setActiveImage(0);

    Promise.all([
      productApi.getById(id),
      productApi.getReviews(id, { page: 0, size: 10 }),
      productApi.getReviewSummary(id),
    ])
      .then(([productRes, reviewsRes, summaryRes]) => {
        const prodData = productRes.data.data;
        setProduct(prodData);
        setReviews(reviewsRes.data.data || { content: [] });
        setSummary(summaryRes.data.data || { averageRating: 0, totalReviews: 0 });

        // Fetch related products in the same category if available
        if (prodData?.category?.id) {
          productApi
            .search({ categoryId: prodData.category.id, size: 5 })
            .then(({ data }) => {
              const list = data.data.content || [];
              setRelatedProducts(list.filter((p) => p.id !== prodData.id).slice(0, 4));
            })
            .catch(() => setRelatedProducts([]));
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this product')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      showToast(`Added ${quantity} × "${product.name}" to your cart`);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't add that to your cart"), 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    setWishBusy(true);
    try {
      const nowWishlisted = await toggle(product.id);
      showToast(nowWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update your wishlist'), 'error');
    } finally {
      setWishBusy(false);
    }
  };

  const handleReviewSubmit = async () => {
    setSubmittingReview(true);
    setReviewError('');
    try {
      await reviewApi.submitReview(product.id, { rating: myRating, comment: myComment });
      showToast('Thank you! Your review has been submitted successfully.');
      setReviewDialogOpen(false);
      setMyComment('');
      loadReviewsAndSummary();
    } catch (err) {
      setReviewError(getApiErrorMessage(err, 'Failed to submit review. Note: You can review products from your completed orders.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteMyReview = async (reviewId) => {
    try {
      await reviewApi.deleteMyReview(product.id, reviewId);
      showToast('Review removed.');
      loadReviewsAndSummary();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete review.'), 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained">
          Back to Shop
        </Button>
      </Container>
    );
  }

  const images = product.images?.length ? product.images : [null];
  const inStock = product.stockStatus !== 'OUT_OF_STOCK';
  const maxQuantity = product.currentStock ?? 99;

  // Calculate discount percentage if MRP is higher than selling price
  const hasDiscount = product.mrp && product.mrp > product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/products" underline="hover" color="text.secondary">
          Shop
        </Link>
        <Link
          component={RouterLink}
          to={`/products?categoryId=${product.category?.id}`}
          underline="hover"
          color="text.secondary"
        >
          {product.category?.name}
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      {/* Main Product Info */}
      <Grid container spacing={5}>
        {/* Product Image Gallery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              aspectRatio: '1 / 1',
              bgcolor: 'grey.100',
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              mb: 2,
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            {images[activeImage] ? (
              <Box
                component="img"
                src={resolveImageUrl(images[activeImage].imageUrl)}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              />
            ) : (
              <ShoppingBasketOutlinedIcon sx={{ fontSize: 72, color: 'grey.400' }} />
            )}

            {hasDiscount && (
              <Chip
                icon={<LocalOfferOutlinedIcon fontSize="small" />}
                label={`${discountPercent}% OFF`}
                color="secondary"
                size="small"
                sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 700 }}
              />
            )}
          </Box>

          {images.length > 1 && (
            <Stack direction="row" spacing={1.5}>
              {images.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: idx === activeImage ? 'primary.main' : 'transparent',
                    bgcolor: 'grey.100',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {img && (
                    <Box
                      component="img"
                      src={resolveImageUrl(img.imageUrl)}
                      alt=""
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Product Details & Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}
          >
            {product.category?.name}
            {product.brand ? ` · ${product.brand}` : ''}
          </Typography>

          <Typography variant="h3" sx={{ mb: 1.5, fontWeight: 700 }}>
            {product.name}
          </Typography>

          {summary.totalReviews > 0 && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <Rating value={summary.averageRating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {summary.averageRating.toFixed(1)} ({summary.totalReviews} review
                {summary.totalReviews === 1 ? '' : 's'})
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
            <PriceTag price={product.sellingPrice} mrp={product.mrp} size="large" />
            <StockChip inStock={inStock} stockQuantity={product.currentStock} />
          </Stack>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Unit: {formatUnit(product.unit, product.weightValue)}
          </Typography>

          {product.description && (
            <Typography sx={{ mb: 4, whiteSpace: 'pre-line', lineHeight: 1.6 }} color="text.secondary">
              {product.description}
            </Typography>
          )}

          {isCustomer && inStock && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.5 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    sx={{ minWidth: 36, textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                  >
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <IconButton
                  onClick={handleToggleWishlist}
                  disabled={wishBusy}
                  sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, display: { xs: 'flex', sm: 'none' } }}
                  aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {isWishlisted(product.id) ? <FavoriteIcon color="secondary" /> : <FavoriteBorderOutlinedIcon />}
                </IconButton>
              </Stack>

              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCart}
                disabled={adding}
                sx={{ flex: 1, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
              >
                {adding ? 'Adding…' : 'Add to Cart'}
              </Button>

              <IconButton
                onClick={handleToggleWishlist}
                disabled={wishBusy}
                sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, display: { xs: 'none', sm: 'flex' } }}
                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlisted(product.id) ? <FavoriteIcon color="secondary" /> : <FavoriteBorderOutlinedIcon />}
              </IconButton>
            </Stack>
          )}

          {!isCustomer && (
            <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ py: 1.5, px: 4 }}>
              Log in to Add to Cart
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Customer Reviews Section */}
      <Divider sx={{ my: 6 }} />

      <Box sx={{ maxWidth: 800 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Customer Reviews
          </Typography>
          {isCustomer && (
            <Button
              startIcon={<RateReviewOutlinedIcon />}
              variant="outlined"
              onClick={() => setReviewDialogOpen(true)}
            >
              Write a Review
            </Button>
          )}
        </Stack>

        {reviews.content.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No reviews yet for this product. Be the first customer to share your feedback!
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {reviews.content.map((review) => (
              <Paper key={review.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography fontWeight={700}>{review.customerName}</Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      {formatDateTime(review.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
                {review.comment && (
                  <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.5 }}>
                    {review.comment}
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <>
          <Divider sx={{ my: 6 }} />
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((relProduct) => (
              <Grid key={relProduct.id} size={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                <ProductCard product={relProduct} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Write / Edit Review Modal Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Product Review</DialogTitle>
        <DialogContent>
          {reviewError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {reviewError}
            </Alert>
          )}
          <Box sx={{ py: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Rating
            </Typography>
            <Rating
              value={myRating}
              onChange={(_e, newValue) => setMyRating(newValue || 5)}
              size="large"
              sx={{ mb: 3 }}
            />
            <TextField
              label="Review Comments"
              multiline
              rows={4}
              fullWidth
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you like or dislike about this product?"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReviewSubmit} disabled={submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}