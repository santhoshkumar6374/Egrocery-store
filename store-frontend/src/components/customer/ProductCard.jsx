import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';

import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';

import PriceTag from '../common/PriceTag';
import { resolveImageUrl, formatUnit } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';

export default function ProductCard({ product }) {
  const { isCustomer } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { showToast } = useToast();

  const [adding, setAdding] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  const imageUrl = resolveImageUrl(product.primaryImageUrl);
  const wishlisted = isWishlisted(product.id);

  const handleToggleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setWishBusy(true);

    try {
      const nowWishlisted = await toggle(product.id);

      showToast(
        nowWishlisted
          ? 'Added to wishlist'
          : 'Removed from wishlist',
      );
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          'Could not update your wishlist',
        ),
        'error',
      );
    } finally {
      setWishBusy(false);
    }
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setAdding(true);

    try {
      await addItem(product.id, 1);

      showToast(
        `Added "${product.name}" to your cart`,
      );
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          "Couldn't add that to your cart",
        ),
        'error',
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition:
          'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow:
            '0 12px 28px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* DISCOUNT BADGE */}
      {product.discountPercent > 0 && (
        <Chip
          label={`${product.discountPercent}% OFF`}
          size="small"
          color="secondary"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
            fontWeight: 700,
            borderRadius: 1.5,
          }}
        />
      )}

      {/* WISHLIST BUTTON */}
      {isCustomer && (
        <IconButton
          onClick={handleToggleWishlist}
          disabled={wishBusy}
          size="small"
          aria-label={
            wishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            width: 36,
            height: 36,
            bgcolor: 'rgba(255,255,255,0.92)',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.12)',
            '&:hover': {
              bgcolor: '#fff',
            },
          }}
        >
          {wishlisted ? (
            <FavoriteIcon
              fontSize="small"
              color="secondary"
            />
          ) : (
            <FavoriteBorderOutlinedIcon
              fontSize="small"
            />
          )}
        </IconButton>
      )}

      {/* PRODUCT CONTENT */}
      <CardActionArea
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{
          flex: 1,
          alignItems: 'stretch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* IMAGE */}
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
            <Box
              component="img"
              src={imageUrl}
              alt={product.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition:
                  'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.04)',
                },
              }}
            />
          ) : (
            <ShoppingBasketOutlinedIcon
              sx={{
                fontSize: 48,
                color: 'grey.400',
              }}
            />
          )}
        </Box>

        {/* PRODUCT DETAILS */}
        <Box
          sx={{
            p: 2,
            pb: 1,
            flex: 1,
          }}
        >
          {/* CATEGORY */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontFamily:
                '"IBM Plex Mono", monospace',
              fontSize: 11,
            }}
          >
            {product.categoryName}
            {product.brand
              ? ` · ${product.brand}`
              : ''}
          </Typography>

          {/* PRODUCT NAME */}
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              mt: 0.5,
              mb: 0.5,
              lineHeight: 1.3,
            }}
            noWrap
          >
            {product.name}
          </Typography>

          {/* UNIT */}
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {formatUnit(
              product.unit,
              product.weightValue,
            )}
          </Typography>
        </Box>
      </CardActionArea>

      {/* ================================
          PRICE + CART BUTTON
      ================================= */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          pt: 2,
          pb: 2,
          gap: 3,
          minHeight: 72,
        }}
      >
        {/* PRICE */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <PriceTag
            price={product.sellingPrice}
            mrp={product.mrp}
          />
        </Box>

        {/* CART BUTTON */}
        <Button
          variant="contained"
          size="small"
          disabled={
            !product.inStock ||
            !isCustomer ||
            adding
          }
          onClick={handleAddToCart}
          sx={{
            minWidth: 46,
            width: 46,
            height: 42,
            p: 0,
            flexShrink: 0,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          }}
          aria-label={`Add ${product.name} to cart`}
        >
          <AddShoppingCartOutlinedIcon
            fontSize="small"
          />
        </Button>
      </Stack>
    </Card>
  );
}