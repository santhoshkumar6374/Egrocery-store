import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/userApi';
import { addressApi } from '../../api/addressApi';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';
import AddAddressDialog from '../../components/customer/AddAddressDialog';
export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
    }
  }, [user]);
  const loadAddresses = () => {
    setAddressLoading(true);
    addressApi
      .list()
      .then(({ data }) => setAddresses(data.data || []))
      .catch(() => setAddresses([]))
      .finally(() => setAddressLoading(false));
  };
  useEffect(() => {
    loadAddresses();
  }, []);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    try {
      await userApi.updateProfile({ name, mobile });
      await refreshProfile();
      showToast('Profile details updated successfully!');
    } catch (err) {
      setProfileError(getApiErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setProfileSaving(false);
    }
  };
  const handleDeleteAddress = async (addressId) => {
    try {
      await addressApi.remove(addressId);
      showToast('Address removed.');
      loadAddresses();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete address.'), 'error');
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        My Profile
      </Typography>
      <Grid container spacing={4}>
        {/* Left Column: Personal Information & Change Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <PersonOutlinedIcon color="primary" />
              <Typography variant="h6">Personal Details</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            {profileError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {profileError}
              </Alert>
            )}
            <Box component="form" onSubmit={handleUpdateProfile} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  fullWidth
                  helperText="Email address cannot be changed"
                />
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  fullWidth
                  placeholder="10-digit mobile number"
                />
                <Button type="submit" variant="contained" size="large" disabled={profileSaving} sx={{ alignSelf: 'flex-start' }}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        {/* Right Column: Saved Delivery Addresses */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: '#e8f5ee',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocationOnOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Saved Delivery Addresses
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Manage your shipping locations
                  </Typography>
                </Box>
              </Stack>

              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="medium"
                onClick={() => setAddAddressOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(7, 94, 63, 0.2)',
                  whiteSpace: 'nowrap',
                }}
              >
                Add Address
              </Button>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {addressLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={30} />
              </Box>
            ) : addresses.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#f9fbf9',
                  border: '1px dashed #c8dacd',
                  borderRadius: 3,
                  my: 2,
                }}
              >
                <Typography sx={{ fontSize: 36, mb: 1 }}>📍</Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  No saved addresses yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                  Save your home or work address for quick checkout.
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setAddAddressOpen(true)}
                  sx={{ borderRadius: 2.5, px: 3.5, py: 1.1, fontWeight: 700 }}
                >
                  Add Your First Address
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {addresses.map((addr) => (
                  <Paper
                    key={addr.id}
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 2.5, position: 'relative', transition: '0.2s', '&:hover': { borderColor: 'primary.light' } }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                          <Typography fontWeight={800}>{addr.label}</Typography>
                          {addr.isDefault && <Chip label="Default" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {addr.addressLine}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {addr.city} - {addr.pincode}
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleDeleteAddress(addr.id)} aria-label="Delete address">
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
      <AddAddressDialog
        open={addAddressOpen}
        onClose={() => setAddAddressOpen(false)}
        onAdded={() => {
          showToast('New address saved!');
          loadAddresses();
        }}
      />
    </Container>
  );
}
