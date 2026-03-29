import React, { useEffect, useState, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Grid,
  Skeleton,
  Alert
} from '@mui/material';
import { Home as HomeIcon, Search } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/properties/PropertyCard';
import { propertyService } from '../services/propertyService';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    propertyTypes: 0,
    cities: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertyService.getProperties();
        const data = response.data;
        const results = data.results || [];

        setProperties(results);

        const propertyTypes = new Set(results.map(p => p.property_type).filter(Boolean)).size;
        const cities = new Set(results.map(p => p.city).filter(Boolean)).size;

        setStats({
          total: data.count || results.length,
          propertyTypes,
          cities,
        });
      } catch (err) {
        console.error('Error loading home data:', err);
        setError('Failed to load properties overview. You can still browse all listings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const recentProperties = useMemo(
    () => properties.slice(0, 3),
    [properties]
  );

  const featuredProperties = useMemo(() => {
    if (!properties.length) return [];
    const sorted = [...properties].sort((a, b) => Number(b.price) - Number(a.price));
    return sorted.slice(0, 3);
  }, [properties]);

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <HomeIcon 
          sx={{ 
            fontSize: 80, 
            color: 'primary.main', 
            mb: 3 
          }} 
        />
        
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Find Your Dream Home
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600 }}
        >
          Discover the perfect property from our extensive collection of homes, 
          apartments, condos, and more. Start your property search today!
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Search />}
            component={Link}
            to="/properties"
            sx={{ px: 4, py: 1.5 }}
          >
            Browse Properties
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/register"
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mt: 2,
          mb: 6,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4,
          width: '100%',
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        {[ 
          { label: 'Available Properties', value: stats.total },
          { label: 'Property Types', value: stats.propertyTypes },
          { label: 'Cities Available', value: stats.cities },
        ].map((item) => (
          <Box key={item.label} sx={{ textAlign: 'center' }}>
            {loading ? (
              <Skeleton variant="text" width={80} height={40} sx={{ mx: 'auto', mb: 1 }} />
            ) : (
              <Typography variant="h4" color="primary.main" fontWeight="600">
                {item.value || 0}
              </Typography>
            )}
            <Typography variant="body1" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {loading ? (
        <Box sx={{ mb: 6 }}>
          <Skeleton variant="text" width={220} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid key={i} item xs={12} sm={6} md={4}>
                <Skeleton variant="rectangular" height={260} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : recentProperties.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Recently Added
          </Typography>
          <Grid container spacing={3}>
            {recentProperties.map((property) => (
              <Grid key={property.id} item xs={12} sm={6} md={4}>
                <PropertyCard property={property} onFavoriteChange={() => {}} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {!loading && featuredProperties.length > 0 && (
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Featured Homes
          </Typography>
          <Grid container spacing={3}>
            {featuredProperties.map((property) => (
              <Grid key={property.id} item xs={12} sm={6} md={4}>
                <PropertyCard property={property} onFavoriteChange={() => {}} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Home;
