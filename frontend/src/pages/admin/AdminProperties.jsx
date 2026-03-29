import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Edit, Add, Delete } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { propertyService } from '../../services/propertyService.js';
import Pagination from '../../components/common/Pagination.jsx';
import { formatPrice } from '../../utils/formatters.js';

const ITEMS_PER_PAGE = 12;

const emptyForm = {
  title: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  property_type: 'house',
  description: '',
  image_url: '',
  is_available: true,
};

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadProperties = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getProperties({ page: pageNumber });
      const data = response.data || {};
      setProperties(data.results || []);
      const count = data.count || 0;
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
    } catch (err) {
      console.error('Error loading admin properties:', err);
      setError('Failed to load properties. Make sure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties(page);
  }, [loadProperties, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (property) => {
    setEditingId(property.id);
    setFormValues({
      title: property.title || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zip_code: property.zip_code || '',
      price: property.price || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      sqft: property.sqft || '',
      property_type: property.property_type || 'house',
      description: property.description || '',
      image_url: property.image_url || '',
      is_available: property.is_available,
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formValues,
        price: Number(formValues.price) || 0,
        bedrooms: Number(formValues.bedrooms) || 0,
        bathrooms: Number(formValues.bathrooms) || 0,
        sqft: Number(formValues.sqft) || 0,
      };

      if (!payload.title || !payload.city || !payload.state) {
        toast.error('Title, city, and state are required');
        return;
      }

      if (editingId) {
        await propertyService.updateProperty(editingId, payload);
        toast.success('Property updated');
      } else {
        await propertyService.createProperty(payload);
        toast.success('Property created');
      }

      setFormOpen(false);
      loadProperties(page);
    } catch (err) {
      console.error('Error saving property:', err);
      const detail = err?.response?.data?.detail;
      toast.error(detail || 'Failed to save property');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await propertyService.deleteProperty(id);
      toast.success('Property deleted');
      loadProperties(page);
    } catch (err) {
      console.error('Error deleting property:', err);
      toast.error('Failed to delete property');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Admin Properties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all property listings. Only admin users should access this page.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Add Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Beds</TableCell>
              <TableCell align="center">Baths</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading properties...
                </TableCell>
              </TableRow>
            ) : properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>{property.property_type}</TableCell>
                  <TableCell align="right">{formatPrice(property.price)}</TableCell>
                  <TableCell align="center">{property.bedrooms}</TableCell>
                  <TableCell align="center">{property.bathrooms}</TableCell>
                  <TableCell align="center">
                    {property.is_available ? (
                      <Chip label="Available" color="success" size="small" />
                    ) : (
                      <Chip label="Not Available" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(property)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(property.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            showItemsPerPage={false}
            onPageChange={handlePageChange}
          />
        </Box>
      )}

      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={formValues.title}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
          />
          <TextField
            label="Address"
            value={formValues.address}
            onChange={(e) => handleChange('address', e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={formValues.city}
              onChange={(e) => handleChange('city', e.target.value)}
              fullWidth
            />
            <TextField
              label="State/Province"
              value={formValues.state}
              onChange={(e) => handleChange('state', e.target.value)}
              fullWidth
            />
            <TextField
              label="Postal Code"
              value={formValues.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              fullWidth
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Price (Rs)"
              type="number"
              value={formValues.price}
              onChange={(e) => handleChange('price', e.target.value)}
              fullWidth
            />
            <TextField
              label="Bedrooms"
              type="number"
              value={formValues.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
              fullWidth
            />
            <TextField
              label="Bathrooms"
              type="number"
              value={formValues.bathrooms}
              onChange={(e) => handleChange('bathrooms', e.target.value)}
              fullWidth
            />
            <TextField
              label="Area (sqft)"
              type="number"
              value={formValues.sqft}
              onChange={(e) => handleChange('sqft', e.target.value)}
              fullWidth
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Property Type"
              select
              value={formValues.property_type}
              onChange={(e) => handleChange('property_type', e.target.value)}
              fullWidth
            >
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="townhouse">Townhouse</MenuItem>
            </TextField>
            <TextField
              label="Image URL"
              value={formValues.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              fullWidth
            />
          </Box>
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={formValues.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Save Changes' : 'Create Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProperties;
