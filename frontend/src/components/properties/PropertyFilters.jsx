import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Collapse,
  IconButton,
  Chip,
  Slider
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { propertyFilters } from '../../services/propertyService';

const PropertyFilters = ({ onFiltersChange, loading = false, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    propertyType: 'all',
    minBedrooms: '',
    minPrice: '',
    maxPrice: '',
    ordering: '-created_at',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const minPrice = 0;
  const maxPrice = 5000000;

  useEffect(() => {
    const min = filters.minPrice ? parseInt(filters.minPrice) : minPrice;
    const max = filters.maxPrice ? parseInt(filters.maxPrice) : maxPrice;
    setPriceRange([min, max]);
  }, [filters.minPrice, filters.maxPrice]);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setFilters(prev => ({
      ...prev,
      minPrice: newValue[0] === minPrice ? '' : newValue[0].toString(),
      maxPrice: newValue[1] === maxPrice ? '' : newValue[1].toString()
    }));
  };

  const handleApplyFilters = () => {
    const searchParams = propertyFilters.buildSearchParams(filters);
    onFiltersChange(searchParams);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      city: '',
      state: '',
      propertyType: 'all',
      minBedrooms: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(clearedFilters);
    setPriceRange([minPrice, maxPrice]);
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.city) count++;
    if (filters.state) count++;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.minBedrooms) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography variant="h6" component="h2">
            Property Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip 
              label={`${activeFilterCount} active`} 
              size="small" 
              color="primary" 
            />
          )}
        </Box>
        
        <IconButton 
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="small"
        >
          {showAdvanced ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="City"
            variant="outlined"
            size="small"
            fullWidth
            value={filters.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="e.g. Kathmandu"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="State"
            variant="outlined"
            size="small"
            fullWidth
            value={filters.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="e.g. Bagmati"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={filters.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              label="Property Type"
            >
              {propertyFilters.propertyTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.ordering}
              onChange={(e) => handleInputChange('ordering', e.target.value)}
              label="Sort By"
            >
              <MenuItem value="-created_at">Newest First</MenuItem>
              <MenuItem value="created_at">Oldest First</MenuItem>
              <MenuItem value="-price">Price: High to Low</MenuItem>
              <MenuItem value="price">Price: Low to High</MenuItem>
              <MenuItem value="-bedrooms">Bedrooms: High to Low</MenuItem>
              <MenuItem value="bedrooms">Bedrooms: Low to High</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Search />}
              onClick={handleApplyFilters}
              disabled={loading}
              sx={{ minHeight: 40 }}
            >
              Search
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={loading}
                sx={{ minHeight: 40, minWidth: 'auto', px: 1 }}
              >
                <Clear />
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Collapse in={showAdvanced}>
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Minimum Bedrooms</InputLabel>
                <Select
                  value={filters.minBedrooms}
                  onChange={(e) => handleInputChange('minBedrooms', e.target.value)}
                  label="Minimum Bedrooms"
                >
                  {propertyFilters.bedroomOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ px: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatPrice}
                  min={minPrice}
                  max={maxPrice}
                  step={25000}
                  marks={[
                    { value: 0, label: 'Rs 0' },
                    { value: 1000000, label: 'Rs 10L' },
                    { value: 2500000, label: 'Rs 25L' },
                    { value: 5000000, label: 'Rs 50L+' }
                  ]}
                  sx={{ mt: 2 }}
                />
              </Box>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="Min Price"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                placeholder="0"
                 InputProps={{
                   startAdornment: 'Rs'
                 }}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="Max Price"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                placeholder="No limit"
                 InputProps={{
                   startAdornment: 'Rs'
                 }}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PropertyFilters;
