import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Stack,
  Badge,
} from '@mui/material';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { SHOP_NAME } from "../utils/constants";

export default function TopNav() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleLogout = async () => {
    setMenuAnchor(null);
    await logout();
    navigate('/');
  };

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ minHeight: 68, gap: 3 }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h5"
            sx={{ fontWeight: 700, letterSpacing: '-0.01em', mr: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ShoppingBasketOutlinedIcon fontSize="medium" />
            {SHOP_NAME}
          </Typography>

          <Stack direction="row" spacing={2.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button component={RouterLink} to="/" color="inherit">
              Home
            </Button>
            <Button component={RouterLink} to="/products" color="inherit">
              Shop
            </Button>
            {isAuthenticated && !isAdmin && (
              <>
                <Button component={RouterLink} to="/orders" color="inherit">
                  My Orders
                </Button>
                <Button
                  component={RouterLink}
                  to="/assistant"
                  color="inherit"
                  startIcon={<ChatBubbleOutlineOutlinedIcon fontSize="small" />}
                >
                  Ask the Shop
                </Button>
              </>
            )}
            {isAdmin && (
              <Button component={RouterLink} to="/admin" color="inherit">
                Admin Console
              </Button>
            )}
          </Stack>

          {isAuthenticated && !isAdmin && (
            <>
              <IconButton component={RouterLink} to="/wishlist" color="inherit" aria-label="View wishlist">
                <FavoriteBorderOutlinedIcon />
              </IconButton>
              <IconButton component={RouterLink} to="/cart" color="inherit" aria-label="View cart">
                <Badge badgeContent={cart.totalItems} color="secondary">
                  <ShoppingBasketOutlinedIcon />
                </Badge>
              </IconButton>
            </>
          )}

          {isAuthenticated ? (
            <>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ ml: 1 }} aria-label="Account menu">
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 15 }}>
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Stack>
                    <Typography variant="body2" fontWeight={700}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Stack>
                </MenuItem>
                <Divider />
                {!isAdmin && (
                  <MenuItem component={RouterLink} to="/profile" onClick={() => setMenuAnchor(null)}>
                    My Profile
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <Button component={RouterLink} to="/login" color="inherit">
                Log In
              </Button>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary" disableElevation>
                Sign Up
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Box className="awning-stripe" aria-hidden="true" />
    </Box>
  );
}