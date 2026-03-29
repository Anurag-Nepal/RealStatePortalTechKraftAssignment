import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  Home,
  Favorite,
  Person,
  TrendingUp,
  Visibility,
  Settings
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { favouriteService } from '../services/favouriteService';
import { propertyService } from '../services/propertyService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    favouritesCount: 0,
    propertiesViewed: 0,
    totalProperties: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'buyer') {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      
      const favouritesResponse = await favouriteService.getFavourites();
      const favouritesCount = favouritesResponse.data?.results?.length || 0;

      const propertiesResponse = await propertyService.getProperties();
      const totalProperties = propertiesResponse.data?.count || 0;
      const viewedProperties = JSON.parse(localStorage.getItem('viewedProperties') || '[]');

      setStats({
        favouritesCount,
        propertiesViewed: viewedProperties.length,
        totalProperties
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Some information may be unavailable.');
      
      
      setStats({
        favouritesCount: 0,
        propertiesViewed: 0,
        totalProperties: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'agent':
        return 'warning';
      case 'buyer':
      default:
        return 'primary';
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = 'primary', loading = false }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, mr: 2 }}>
            <Icon sx={{ color: `${color}.main` }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <CircularProgress size={32} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 700, color: `${color}.main` }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name || 'User'}! Here's an overview of your account.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

       <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '2rem',
                  mr: 2,
                  border: '3px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  {user?.email || 'No email'}
                </Typography>
                <Chip
                  label={user?.role?.toUpperCase() || 'USER'}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
            
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
            
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                Member since
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatDate(user?.created_at)}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/profile"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          {user?.role === 'buyer' ? (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StatCard
                    icon={Favorite}
                    title="Saved Properties"
                    value={stats.favouritesCount}
                    color="error"
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatCard
                    icon={Visibility}
                    title="Properties Viewed"
                    value={stats.propertiesViewed}
                    color="info"
                    loading={loading}
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Activity Summary
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="body1">Account Status</Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Favorite sx={{ mr: 2, color: 'error.main' }} />
                      <Typography variant="body1">Favorite Properties</Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                      {loading ? '...' : stats.favouritesCount}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Settings sx={{ mr: 2, color: 'warning.main' }} />
                      <Typography variant="body1">Settings</Typography>
                    </Box>
                    <Chip label="Coming Soon" size="small" />
                  </Box>
                </Stack>
              </Paper>
            </>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Admin Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the navigation to manage properties and viewing requests.
              </Typography>
            </Paper>
          )}
        </Grid>

        {user?.role === 'buyer' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    component={Link}
                    to="/properties"
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Home sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Browse Properties
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Explore properties available for you
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    component={Link}
                    to="/favourites"
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Favorite sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        My Favourites
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View your saved properties
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    component={Link}
                    to="/profile"
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Person sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Profile Settings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Update your personal information
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
