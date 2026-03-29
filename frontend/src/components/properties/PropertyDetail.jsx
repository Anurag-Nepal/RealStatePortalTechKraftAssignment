import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Chip,
  IconButton,
  Button,
  Divider,
  Paper,
  Skeleton,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MobileStepper,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Bed,
  Bathtub,
  SquareFoot,
  CalendarToday,
  ArrowBack,
  Share,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/propertyService';
import { favouriteService } from '../../services/favouriteService';
import { viewingService } from '../../services/viewingService';
import { formatPrice as formatNprPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const trackViewedProperty = (propertyId) => {
    if (!propertyId) return;
    try {
      const raw = localStorage.getItem('viewedProperties');
      const parsed = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      const set = new Set(parsed);
      set.add(propertyId);
      const next = Array.from(set).slice(-100);
      localStorage.setItem('viewedProperties', JSON.stringify(next));
    } catch {
      localStorage.setItem('viewedProperties', JSON.stringify([propertyId]));
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getProperty(id);
      setProperty(response.data);
      setIsFavorited(response.data.is_favourited || false);
      setActiveImageIndex(0);
      trackViewedProperty(response.data.id);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast('Please login to save favorites');
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      await favouriteService.toggleFavourite(property.id, isFavorited);
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

   const handleOpenSchedule = () => {
    if (!user) {
      toast('Please login to schedule a viewing');
      navigate('/login');
      return;
    }
    setScheduleOpen(true);
  };

  const handleCloseSchedule = () => {
    setScheduleOpen(false);
    setScheduleDate('');
    setScheduleTime('');
    setScheduleNotes('');
  };

  const handleSubmitSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select a date and time');
      return;
    }

    const scheduledDatetime = new Date(`${scheduleDate}T${scheduleTime}:00`);
    const now = new Date();

    if (scheduledDatetime <= now) {
      toast.error('Please choose a time in the future');
      return;
    }

    try {
      setScheduleLoading(true);
      await viewingService.createViewingRequest({
        propertyId: property.id,
        scheduledDatetime: scheduledDatetime.toISOString(),
        notes: scheduleNotes,
      });
      toast.success('Viewing scheduled. A confirmation email has been sent.');
      handleCloseSchedule();
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      const message =
        error?.response?.data?.scheduled_datetime?.[0] ||
        error?.response?.data?.detail ||
        'Failed to schedule viewing. Please try again.';
      toast.error(message);
    } finally {
      setScheduleLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const imageSources = React.useMemo(() => {
    if (!property) return [];
    const gallery = Array.isArray(property.image_gallery) ? property.image_gallery : [];
    if (gallery.length) return gallery;
    return property.image_url ? [property.image_url] : [];
  }, [property]);

  const handleNextImage = () => {
    if (!imageSources.length) return;
    setActiveImageIndex((prev) => (prev + 1) % imageSources.length);
  };

  const handlePrevImage = () => {
    if (!imageSources.length) return;
    setActiveImageIndex((prev) => (prev - 1 + imageSources.length) % imageSources.length);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={30} width="60%" />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Property not found'}
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/properties')}>
          Back to Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/properties')}
        sx={{ mb: 3 }}
      >
        Back to Properties
      </Button>

      <Card sx={{ mb: 4, position: 'relative' }}>
        {imageSources.length > 0 ? (
          <CardMedia
            component="img"
            height="500"
            image={imageSources[activeImageIndex]}
            alt={property.title}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <Typography color="text.secondary">No image available</Typography>
          </Box>
        )}
        
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
          <IconButton
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
            }}
          >
            {isFavorited ? (
              <Favorite sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
          <IconButton
            onClick={handleShare}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
            }}
          >
            <Share />
          </IconButton>
        </Box>

        <Chip
          label={property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
          color="primary"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            fontWeight: 600
          }}
        />

        {!property.is_available && (
          <Chip
            label="Not Available"
            color="error"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              fontWeight: 600
            }}
          />
        )}

        {imageSources.length > 1 && (
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <MobileStepper
              variant="dots"
              steps={imageSources.length}
              position="static"
              activeStep={activeImageIndex}
              nextButton={
                <Button size="small" onClick={handleNextImage}>
                  Next
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button size="small" onClick={handlePrevImage}>
                  <KeyboardArrowLeft />
                  Back
                </Button>
              }
            />
          </Box>
        )}
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatNprPrice(property.price)}
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              {property.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <LocationOn sx={{ mr: 0.5 }} />
              <Typography variant="body1">
                {property.address}, {property.city}, {property.state} {property.zip_code}
              </Typography>
            </Box>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Key Features
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Bed sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">{property.bedrooms}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bedrooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Bathtub sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">{property.bathrooms}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bathrooms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <SquareFoot sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">{property.sqft.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Square Feet
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Description
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
              {property.description || 'No description available.'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Property Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Property Type</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {property.is_available ? 'Available' : 'Not Available'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Listed Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(property.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(property.updated_at)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Interested in this property?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Contact us to schedule a viewing or get more information.
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!property.is_available}
                startIcon={<CalendarToday />}
                onClick={handleOpenSchedule}
              >
                 Schedule Viewing
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
              >
                {isFavorited ? 'Saved' : 'Save Property'}
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Property ID
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {property.id}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={scheduleOpen} onClose={handleCloseSchedule} fullWidth maxWidth="sm">
        <DialogTitle>Schedule a Viewing</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Notes (optional)"
              multiline
              minRows={3}
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSchedule} disabled={scheduleLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitSchedule}
            variant="contained"
            disabled={scheduleLoading || !scheduleDate || !scheduleTime}
          >
            {scheduleLoading ? 'Scheduling...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyDetail;
