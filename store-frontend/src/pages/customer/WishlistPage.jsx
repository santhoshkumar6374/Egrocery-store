import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Grid, Button } from '@mui/material';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { useWishlist } from '../../hooks/useWishlist';
import WishlistCard from '../../components/customer/WishlistCard';

export default function WishlistPage() {
  const { items, loading } = useWishlist();

  if (!loading && items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <FavoriteBorderOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 1 }}>
          Your wishlist is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Tap the heart on any product to save it here for later.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" size="large">
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        My Wishlist
      </Typography>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <WishlistCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}