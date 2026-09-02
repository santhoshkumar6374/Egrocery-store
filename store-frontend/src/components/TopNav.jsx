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
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { SHOP_NAME } from "../utils/constants";

export default function TopNav() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMenuAnchor(null);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const mobileDrawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <ShoppingBasketOutlinedIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          {SHOP_NAME}
        </Typography>
      </Toolbar>

      {isAuthenticated && (
        <Box sx={{ p: 2, bgcolor: 'rgba(7, 94, 63, 0.05)', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 38, height: 38, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        <ListItemButton component={RouterLink} to="/" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><HomeOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/products" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><StorefrontOutlinedIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Shop Catalog" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>

        {isAuthenticated && !isAdmin && (
          <>
            <ListItemButton component={RouterLink} to="/orders" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><ReceiptLongOutlinedIcon color="primary" /></ListItemIcon>
              <ListItemText primary="My Orders" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton component={RouterLink} to="/assistant" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><ChatBubbleOutlineOutlinedIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Ask the Shop" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton component={RouterLink} to="/wishlist" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><FavoriteBorderOutlinedIcon color="primary" /></ListItemIcon>
              <ListItemText primary="My Wishlist" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton component={RouterLink} to="/profile" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><PersonOutlineOutlinedIcon color="primary" /></ListItemIcon>
              <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </>
        )}

        {isAdmin && (
          <ListItemButton component={RouterLink} to="/admin" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettingsOutlinedIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Admin Console" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        )}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <Button fullWidth variant="outlined" color="error" startIcon={<LogoutOutlinedIcon />} onClick={handleLogout} sx={{ borderRadius: 2, py: 1 }}>
            Log Out
          </Button>
        ) : (
          <Stack spacing={1.5}>
            <Button fullWidth component={RouterLink} to="/login" variant="outlined" color="primary" startIcon={<LoginOutlinedIcon />} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
              Log In
            </Button>
            <Button fullWidth component={RouterLink} to="/register" variant="contained" color="secondary" startIcon={<PersonAddOutlinedIcon />} onClick={() => setMobileOpen(false)} disableElevation sx={{ borderRadius: 2 }}>
              Sign Up
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 60, md: 68 }, gap: { xs: 1, md: 3 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component={RouterLink}
            to="/"
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.01em',
              mr: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
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
            <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
              <IconButton component={RouterLink} to="/wishlist" color="inherit" aria-label="View wishlist">
                <FavoriteBorderOutlinedIcon />
              </IconButton>
              <IconButton component={RouterLink} to="/cart" color="inherit" aria-label="View cart">
                <Badge badgeContent={cart.totalItems} color="secondary">
                  <ShoppingBasketOutlinedIcon />
                </Badge>
              </IconButton>
            </Stack>
          )}

          {isAuthenticated ? (
            <>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ ml: { xs: 0.5, sm: 1 } }} aria-label="Account menu">
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
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
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

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {mobileDrawerContent}
      </Drawer>
    </Box>
  );
}