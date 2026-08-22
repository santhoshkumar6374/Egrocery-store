import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardActionArea, Box, Typography, Button, Stack, IconButton, Chip } from '@mui/material';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import PriceTag from '../common/PriceTag';
import { resolveImageUrl } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';

export default function WishlistCard({ item }) {
  const { addItem } = useCart();
  const { remove } = useWishlist();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const imageUrl = resolveImageUrl(item.productImage);

  const handleAddToCart = async () => {
    setBusy(true);
    try {
      await addItem(item.productId, 1);
      showToast(`Added "${item.productName}" to your cart`);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Couldn't add that to your cart"), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await remove(item.productId);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not remove that item'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {!item.inStock && (
        <Chip label="Out of stock" size="small" color="error" variant="outlined" sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }} />
      )}
      <IconButton
        onClick={handleRemove}
        disabled={busy}
        size="small"
        aria-label="Remove from wishlist"
        sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1, bgcolor: 'rgba(255,255,255,0.85)' }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>

      <CardActionArea component={RouterLink} to={`/products/${item.productId}`} sx={{ flex: 1 }}>
        <Box
          sx={{
            aspectRatio: '4 / 3',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <Box component="img" src={imageUrl} alt={item.productName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ShoppingBasketOutlinedIcon sx={{ fontSize: 40, color: 'grey.400' }} />
          )}
        </Box>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {item.productName}
          </Typography>
        </Box>
      </CardActionArea>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pt: 1 }}>
        <PriceTag price={item.sellingPrice} mrp={item.mrp} />
        <Button variant="contained" size="small" disabled={!item.inStock || busy} onClick={handleAddToCart} sx={{ minWidth: 0, px: 1.5 }}>
          <AddShoppingCartOutlinedIcon fontSize="small" />
        </Button>
      </Stack>
    </Card>
  );
}