import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Grid,
  Tooltip,
  TableContainer,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { adminCategoryApi } from '../../../api/adminCategoryApi';
import CategoryFormDialog from './CategoryFormDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    setError('');
    adminCategoryApi
      .list()
      .then(({ data }) => setCategories(data.data || []))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load categories')))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const handleSaved = () => {
    setFormOpen(false);
    setEditingCategory(null);
    showToast(editingCategory ? 'Category updated successfully' : 'Category created successfully');
    loadCategories();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminCategoryApi.remove(deleteTarget.id);
      showToast(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete this category'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filter categories client-side by searchQuery
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  const totalProductsCount = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  const activeCategoriesCount = categories.filter((c) => c.status === 'ACTIVE').length;

  return (
    <Box sx={{ pb: 6 }}>
      {/* HEADER BAR */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h4" fontWeight={800}>
              Product Categories
            </Typography>
            <Chip
              label={`${categories.length} Categories`}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: '#e8f5ee',
                color: '#075e3f',
                borderRadius: 2,
              }}
            />
          </Stack>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Organize products into store departments and categories
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
          sx={{
            borderRadius: 3,
            fontWeight: 800,
            px: 3,
            py: 1.2,
            background: 'linear-gradient(135deg, #075e3f 0%, #0aa36f 100%)',
            boxShadow: '0 6px 18px rgba(7, 94, 63, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #064e34 0%, #088a5e 100%)',
              boxShadow: '0 10px 24px rgba(7, 94, 63, 0.38)',
            },
          }}
        >
          New Category
        </Button>
      </Stack>

      {/* SUMMARY STATS BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: '#e8f5ee',
                  color: '#075e3f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CategoryOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Total Categories
                </Typography>
                <Typography variant="h6" fontWeight={800} lineHeight={1}>
                  {categories.length}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Active Departments
                </Typography>
                <Typography variant="h6" fontWeight={800} lineHeight={1}>
                  {activeCategoriesCount}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Inventory2OutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Total Categorized Products
                </Typography>
                <Typography variant="h6" fontWeight={800} lineHeight={1}>
                  {totalProductsCount}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* SEARCH TOOLBAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Filter categories by name or description…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Paper>

      {/* CATEGORIES TABLE */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={42} />
            <Typography color="text.secondary" fontWeight={600}>
              Loading categories...
            </Typography>
          </Stack>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: '#ffffff',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8faf9' }}>
                  <TableCell sx={{ fontWeight: 800, py: 1.8 }}>Category Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8 }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, py: 1.8 }}>
                    Assigned Products
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, py: 1.8 }}>
                    Status
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, py: 1.8 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} hover sx={{ transition: '0.2s' }}>
                    <TableCell sx={{ py: 1.8 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            bgcolor: '#e8f5ee',
                            color: '#075e3f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CategoryOutlinedIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {cat.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{cat.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: 'text.secondary', maxWidth: 340 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {cat.description || 'No description added.'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={`${cat.productCount || 0} Products`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: '#f0f4f1',
                          color: 'primary.main',
                          borderRadius: 1.5,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={cat.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        size="small"
                        color={cat.status === 'ACTIVE' ? 'success' : 'default'}
                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: 11 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingCategory(cat);
                              setFormOpen(true);
                            }}
                            sx={{
                              color: 'primary.main',
                              bgcolor: '#e8f5ee',
                              '&:hover': { bgcolor: '#d3ede0' },
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Category">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(cat)}
                            sx={{
                              color: 'error.main',
                              bgcolor: '#ffebee',
                              '&:hover': { bgcolor: '#ffcdd2' },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ fontSize: 40, mb: 1 }}>📂</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        No categories found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {searchQuery
                          ? 'No category names or descriptions match your query.'
                          : 'No categories created yet. Click "New Category" to create your first one.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* FORM DIALOG */}
      <CategoryFormDialog
        open={formOpen}
        category={editingCategory}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Categories assigned to existing products cannot be deleted.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}