import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Stack
} from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  Refresh,
  Home,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FavouriteCard from '../components/favourites/FavouriteCard';
import { favouriteService } from '../services/favouriteService';
import EmptyState, { NoFavoritesState } from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

const Favourites = () => {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavourites(page);
  }, [page]);

  const fetchFavourites = async (pageNumber = 1) => {
    try {
      setError(null);
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await favouriteService.getFavourites({
        page: pageNumber,
        page_size: DEFAULT_PAGE_SIZE,
      });

      setFavourites(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / DEFAULT_PAGE_SIZE));
    } catch (err) {
      console.error('Error fetching favourites:', err);
      const message = err.response?.status === 401 
        ? 'Please log in to view your favorites'
        : err.response?.data?.message || 'Failed to load favorites';
      
      setError(message);
      
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveFavourite = (favouriteId) => {
    setFavourites(prev => prev.filter(fav => fav.id !== favouriteId));
    setTotalCount(prev => Math.max(0, prev - 1));
    
    
    const newTotalPages = Math.ceil(Math.max(0, totalCount - 1) / DEFAULT_PAGE_SIZE);
    setTotalPages(newTotalPages);
    
    
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages);
    }
    
    
    if (favourites.length === 1 && page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleRefresh = () => {
    fetchFavourites(page);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrowseProperties = () => {
    navigate('/properties');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Favourites
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Properties you've saved for later viewing.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Favourites
          </Typography>
        </Box>

        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{ color: 'text.secondary' }}
          >
            Back
          </Button>
        </Stack>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Favourites
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {totalCount > 0 
                ? `${totalCount} saved ${totalCount === 1 ? 'property' : 'properties'}`
                : 'Properties you\'ve saved for later viewing.'
              }
            </Typography>
          </Box>
          
          {totalCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ flexShrink: 0 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </Box>
      </Box>

      {favourites.length === 0 ? (
        <NoFavoritesState
          size="large"
          actionText="Browse Properties"
          actionPath="/properties"
        />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {favourites.map((favourite) => (
              <Grid item xs={12} sm={6} md={4} key={favourite.id}>
                <FavouriteCard
                  favourite={favourite}
                  onRemove={handleRemoveFavourite}
                />
              </Grid>
            ))}
          </Grid>

           {refreshing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

           {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalCount}
              itemsPerPage={DEFAULT_PAGE_SIZE}
              showItemsPerPage={false}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default Favourites;
