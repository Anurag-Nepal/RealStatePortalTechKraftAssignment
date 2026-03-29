import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Alert,
  Skeleton,
} from '@mui/material';
import { CalendarToday, Home, Refresh } from '@mui/icons-material';
import { viewingService } from '../services/viewingService.js';
import Pagination from '../components/common/Pagination.jsx';
import { formatDate, formatTime } from '../utils/viewingFormatters.js';

const ITEMS_PER_PAGE = 10;

const MyViewings = () => {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadViewings = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await viewingService.listViewings({ page: pageNumber });
      const data = response.data || {};
      setViewings(data.results || []);
      const count = data.count || 0;
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
    } catch (err) {
      console.error('Error loading viewings:', err);
      setError('Failed to load your viewing requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadViewings(page);
  }, [loadViewings, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    loadViewings(page);
  };

  const renderStatusChip = (status) => {
    const value = (status || '').toLowerCase();
    if (value === 'confirmed') {
      return <Chip label="Confirmed" color="success" size="small" />;
    }
    if (value === 'cancelled') {
      return <Chip label="Cancelled" color="error" size="small" />;
    }
    return <Chip label="Pending" color="warning" size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            My Viewings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your scheduled and past property viewing requests.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((key) => (
            <Grid item xs={12} key={key}>
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="80%" height={20} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : viewings.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CalendarToday sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            No viewing requests yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Schedule a viewing from any property detail page to see it listed here.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            href="/properties"
          >
            Browse Properties
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {viewings.map((viewing) => {
              const property = viewing.property || {};
              return (
                <Grid item xs={12} key={viewing.id}>
                  <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {property.title || 'Property viewing'}
                      </Typography>
                      {renderStatusChip(viewing.status)}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {property.address && property.city
                        ? `${property.address}, ${property.city}, ${property.state || ''} ${property.zip_code || ''}`.trim()
                        : 'Address not available'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      <Typography variant="body2">
                        Date: <strong>{formatDate(viewing.scheduled_datetime)}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Time: <strong>{formatTime(viewing.scheduled_datetime)}</strong>
                      </Typography>
                    </Box>

                    {viewing.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Notes: {viewing.notes}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
        </>
      )}
    </Container>
  );
};

export default MyViewings;
