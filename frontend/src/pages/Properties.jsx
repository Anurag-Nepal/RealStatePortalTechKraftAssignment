import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Container,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { propertyService } from '../services/propertyService';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyGrid from '../components/properties/PropertyGrid';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1
  });
  const [filters, setFilters] = useState({ ordering: '-created_at' });
  const ITEMS_PER_PAGE = 12;

  const loadProperties = useCallback(async (searchParams = {}, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...searchParams,
        page: page > 1 ? page : undefined
      };

       const response = await propertyService.getProperties(params);
      const data = response.data;

      setProperties(data.results || []);
      
       const totalPages = Math.ceil(data.count / ITEMS_PER_PAGE);
      
      setPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
        currentPage: page,
        totalPages: totalPages
      });

    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoading(false);
      setProperties([]);
      setPagination((prev) => ({ ...prev, count: 0, totalPages: 1 }));
      return;
    }

    loadProperties();
  }, [loadProperties, user]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    loadProperties(newFilters, 1);
  };

  const handlePageChange = (page) => {
    loadProperties(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavoriteChange = (propertyId, isFavorited) => {
    setProperties(prev => 
      prev.map(property => 
        property.id === propertyId 
          ? { ...property, is_favourited: isFavorited }
          : property
      )
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
       <Box sx={{ mb: 4 }}>
         <Typography
           variant="h3"
           component="h1"
           gutterBottom
           sx={{
             fontWeight: 700,
             color: 'text.primary',
             mb: 1,
           }}
         >
           {user?.role === 'admin' ? 'Admin Property Management' : 'Property Listings'}
         </Typography>
         <Typography
           variant="h6"
           color="text.secondary"
           sx={{ mb: 2 }}
         >
           {user?.role === 'admin'
             ? 'Please use the Admin Properties section to manage listings. This view is for customers only.'
             : 'Discover your perfect home from our extensive collection'}
         </Typography>
       </Box>

       {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

       {user?.role !== 'admin' && (
         <PropertyFilters
           onFiltersChange={handleFiltersChange}
           loading={loading}
         />
       )}

       {user?.role !== 'admin' && !loading && properties.length > 0 && (
        <Box sx={{ mb: 2 }}>
             <Typography variant="h6" color="text.secondary">
             {pagination.count > 0
               ? (() => {
                   const startItem = (pagination.currentPage - 1) * ITEMS_PER_PAGE + 1;
                   const endItem = Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.count);
                   return `Showing ${startItem}-${endItem} of ${pagination.count} properties`;
                 })()
               : 'No properties found'}
           </Typography>
        </Box>
      )}

       {user?.role !== 'admin' && (
         <PropertyGrid
           properties={properties}
           loading={loading}
           onFavoriteChange={handleFavoriteChange}
           emptyStateTitle="No Properties Found"
           emptyStateSubtitle="Try adjusting your search filters or check back later for new listings."
         />
       )}

       {user?.role !== 'admin' && !loading && pagination.totalPages > 1 && (
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
           <Pagination
             currentPage={pagination.currentPage}
             totalPages={pagination.totalPages}
             totalItems={pagination.count}
             itemsPerPage={ITEMS_PER_PAGE}
             showItemsPerPage={false}
             onPageChange={handlePageChange}
           />
        </Box>
      )}

       {user?.role !== 'admin' && !loading && properties.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Found what you're looking for? Browse our{' '}
            <Typography component="span" color="primary.main" sx={{ fontWeight: 600 }}>
              {pagination.count} available properties
            </Typography>
            {' '}and find your dream home today!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Properties;
