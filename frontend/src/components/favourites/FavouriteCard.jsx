import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Skeleton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Home,
  Bathtub,
  SquareFoot,
  Visibility,
  Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  formatPrice, 
  formatBedrooms, 
  formatBathrooms, 
  formatSqft, 
  formatPropertyType,
  formatRelativeDate 
} from '../../utils/formatters';
import { favouriteService } from '../../services/favouriteService';
import { PLACEHOLDER_IMAGES } from '../../utils/constants';


const FavouriteCard = ({ favourite, onRemove, loading = false }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const property = favourite?.property;

  if (loading) {
    return <FavouriteCardSkeleton />;
  }

  if (!property) {
    return null;
  }

  const handleRemoveFavourite = async (e) => {
    e.stopPropagation();
    
    if (removing) return;
    
    try {
      setRemoving(true);
      await favouriteService.removeFavourite(favourite.id);
      toast.success('Property removed from favorites');
      
      if (onRemove) {
        onRemove(favourite.id);
      }
    } catch (error) {
      console.error('Error removing favourite:', error);
      const message = error.response?.data?.message || 'Failed to remove from favorites';
      toast.error(message);
    } finally {
      setRemoving(false);
    }
  };

  const handleViewProperty = () => {
    navigate(`/properties/${property.id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
        },
        opacity: removing ? 0.5 : 1,
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden'
      }}
      onClick={() => !removing && handleViewProperty()}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={imageError || !property.image_url ? PLACEHOLDER_IMAGES.PROPERTY : property.image_url}
          alt={property.title}
          onError={handleImageError}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'grey.100'
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            padding: '4px'
          }}
        >
          <Favorite color="error" fontSize="small" />
        </Box>

        <Chip
          label={formatPropertyType(property.property_type)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 'bold'
          }}
        />

        {!property.is_available && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'error.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            UNAVAILABLE
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography 
          variant="h5" 
          color="primary" 
          gutterBottom
          sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          {formatPrice(property.price)}
        </Typography>

        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3rem'
          }}
        >
          {property.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" noWrap>
            {property.city}, {property.state} {property.zip_code}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {formatBedrooms(property.bedrooms)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <Bathtub fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {formatBathrooms(property.bathrooms)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <SquareFoot fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {formatSqft(property.sqft)}
            </Typography>
          </Box>
        </Stack>

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', mb: 2 }}
        >
          Added {formatRelativeDate(favourite.created_at)}
        </Typography>

        {property.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
          >
            {property.description}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={handleViewProperty}
            fullWidth
            disabled={removing}
          >
            View Details
          </Button>
          <Tooltip title="Remove from favorites">
            <IconButton
              color="error"
              onClick={handleRemoveFavourite}
              disabled={removing}
              sx={{
                border: '1px solid',
                borderColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'white'
                }
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Card>
  );
};


const FavouriteCardSkeleton = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="90%" height={28} />
        <Skeleton variant="text" width="80%" height={20} />
        <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="100%" height={40} />
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Skeleton variant="rectangular" width="100%" height={36} />
      </Box>
    </Card>
  );
};

export default FavouriteCard;