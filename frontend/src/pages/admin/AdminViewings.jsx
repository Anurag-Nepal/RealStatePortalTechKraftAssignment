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
  Chip,
  Alert,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import viewingService from '../../services/viewingService.js';
import Pagination from '../../components/common/Pagination.jsx';

const ITEMS_PER_PAGE = 12;

const AdminViewings = () => {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmingId, setConfirmingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadViewings = useCallback(async (pageNumber = 1, statusValue = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNumber };
      if (statusValue && statusValue !== 'all') {
        params.status = statusValue;
      }
      const response = await viewingService.listViewings(params);
      const data = response.data || {};
      setViewings(data.results || []);
      const count = data.count || 0;
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / ITEMS_PER_PAGE)));
    } catch (err) {
      console.error('Error loading admin viewings:', err);
      setError('Failed to load viewing requests. Make sure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadViewings(page, statusFilter);
  }, [loadViewings, page, statusFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

   const handleConfirm = async (id) => {
    try {
      setConfirmingId(id);
      await viewingService.confirmViewing(id);
      await loadViewings(page);
    } catch (err) {
      console.error('Error confirming viewing:', err);
      alert('Failed to confirm viewing. Please try again.');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setStatusFilter(value);
    setPage(1);
    loadViewings(1, value);
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'default';
      case 'pending':
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Viewing Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            All viewing requests submitted by buyers across all properties.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <Visibility sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>
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
              <TableCell>Property</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Scheduled For</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading viewing requests...
                </TableCell>
              </TableRow>
            ) : viewings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No viewing requests found.
                </TableCell>
              </TableRow>
            ) : (
              viewings.map((viewing) => (
                <TableRow key={viewing.id} hover>
                  <TableCell>{viewing.property_title}</TableCell>
                  <TableCell>{viewing.user_name}</TableCell>
                  <TableCell>{viewing.user_email}</TableCell>
                  <TableCell>{formatDateTime(viewing.scheduled_datetime)}</TableCell>
                  <TableCell>
                    <Chip
                      label={viewing.status}
                      size="small"
                      color={statusColor(viewing.status)}
                    />
                  </TableCell>
                  <TableCell>{viewing.notes || '-'}</TableCell>
                  <TableCell>{formatDateTime(viewing.created_at)}</TableCell>
                  <TableCell align="right">
                    {viewing.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleConfirm(viewing.id)}
                        disabled={!!confirmingId}
                      >
                        {confirmingId === viewing.id ? 'Confirming...' : 'Confirm'}
                      </Button>
                    )}
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
    </Container>
  );
};

export default AdminViewings;
