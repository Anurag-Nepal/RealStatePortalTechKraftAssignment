import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import PropertyCard from './PropertyCard';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import { SearchOff } from '@mui/icons-material';

const PropertyGrid = ({ 
  properties = [], 
  loading = false, 
  onFavoriteChange,
  showFavorites = true,
  emptyStateTitle = "No Properties Found",
  emptyStateSubtitle = "Try adjusting your search filters or check back later for new listings."
}) => {
  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Loader message="Loading properties..." />
      </Box>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        icon={SearchOff}
        title={emptyStateTitle}
        subtitle={emptyStateSubtitle}
        sx={{ py: 8 }}
      />
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 3, fontWeight: 500 }}
      >
        {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} found
      </Typography>

      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <PropertyCard
              property={property}
              onFavoriteChange={onFavoriteChange}
              showFavorite={showFavorites}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PropertyGrid;
