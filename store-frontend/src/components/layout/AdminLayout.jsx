import { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Stack,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import { useAuth } from '../../hooks/useAuth';
import { SHOP_NAME } from '../../utils/constants';
const DRAWER_WIDTH = 248;
const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: DashboardOutlinedIcon },
  { label: 'Products', to: '/admin/products', icon: Inventory2OutlinedIcon },
  { label: 'Categories', to: '/admin/categories', icon: CategoryOutlinedIcon },
  { label: 'Inventory', to: '/admin/inventory', icon: WarehouseOutlinedIcon },
  { label: 'Customers', to: '/admin/customers', icon: PeopleAltOutlinedIcon },
  { label: 'Orders', to: '/admin/orders', icon: ReceiptLongOutlinedIcon },
  { label: 'Payments', to: '/admin/payments', icon: PaymentsOutlinedIcon },
  { label: 'Coupons', to: '/admin/coupons', icon: LocalOfferOutlinedIcon },
  { label: 'Reviews', to: '/admin/reviews', icon: RateReviewOutlinedIcon },
  { label: 'Delivery Settings', to: '/admin/delivery-settings', icon: LocalShippingOutlinedIcon },
  { label: 'Reports', to: '/admin/reports', icon: SummarizeOutlinedIcon },
];
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const handleLogout = async () => {
    setMenuAnchor(null);
    await logout();
    navigate('/login');
  };
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Box component="img" src="/logo.png" alt="EGrocery" sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {SHOP_NAME}
        </Typography>
      </Toolbar>
      <Typography
        variant="overline"
        sx={{ px: 2.5, color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}
      >
        Shop Owner Console
      </Typography>
      <List sx={{ px: 1.5, mt: 1, flex: 1 }}>
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const selected = to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);
          return (
            <ListItemButton
              key={to}
              component={RouterLink}
              to={to}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}>{label}</ListItemText>
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="body2" fontWeight={700} noWrap>
          {user?.name}
        </Typography>
      </Box>
    </Box>
  );
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#FFFFFF',
          color: 'text.primary',
          borderBottom: '1px solid #E4DFD1',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontFamily: 'body' }}>
            {NAV_ITEMS.find((n) => (n.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.to)))
              ?.label ?? 'Dashboard'}
          </Typography>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem component={RouterLink} to="/" onClick={() => setMenuAnchor(null)}>
              View Storefront
            </MenuItem>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid #E4DFD1', boxSizing: 'border-box' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 4 } }}>
          <Stack>
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}