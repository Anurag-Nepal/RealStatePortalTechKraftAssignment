import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Bed,
  Bathtub,
  SquareFoot,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { favouriteService } from '../../services/favouriteService';
import toast from 'react-hot-toast';
import { formatPrice, formatSqft } from '../../utils/formatters';

const PropertyCard = ({ property, onFavoriteChange, showFavorite = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(property.is_favourited || false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getPropertyTypeColor = (type) => {
    const colors = {
      house: 'primary',
      apartment: 'secondary', 
      condo: 'success',
      townhouse: 'warning'
    };
    return colors[type] || 'default';
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast('Please login to save favorites');
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      await favouriteService.toggleFavourite(property.id, isFavorited);
      setIsFavorited(!isFavorited);
      onFavoriteChange && onFavoriteChange(property.id, !isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
        },
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden'
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: 'relative', paddingTop: '60%' }}>
        {imageLoading && (
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%" 
            sx={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        
        {!imageError && property.image_url && (
          <CardMedia
            component="img"
            image={property.image_url}
            alt={property.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        )}

        {(imageError || !property.image_url) && !imageLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey.200',
              color: 'grey.500'
            }}
          >
            <Typography variant="h6">No Image</Typography>
          </Box>
        )}

        <Chip
          label={property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
          color={getPropertyTypeColor(property.property_type)}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />

        {showFavorite && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Tooltip title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                onClick={handleFavoriteClick}
                disabled={favoriteLoading}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  },
                  width: 40,
                  height: 40
                }}
              >
                {isFavorited ? (
                  <Favorite sx={{ color: 'error.main', fontSize: 20 }} />
                ) : (
                  <FavoriteBorder sx={{ color: 'grey.600', fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {!property.is_available && (
          <Chip
            label="Not Available"
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              fontWeight: 600
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          {formatPrice(property.price)}
        </Typography>

        <Typography 
          variant="h6" 
          component="h3"
          sx={{ 
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            minHeight: '2.6em'
          }}
        >
          {property.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {property.address}, {property.city}, {property.state} {property.zip_code}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Bed sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Bathtub sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SquareFoot sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {formatSqft(property.sqft)} sqft
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
