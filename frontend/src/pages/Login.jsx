import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin/properties', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setLoading(true);
    setError('');

    try {
      
       const result = await login(values.email, values.password, {
         showLoadingToast: false, 
         showSuccessToast: true   
       });
       
       if (result.success) {
        const loggedInUser = result.user;
        const from = location.state?.from?.pathname;

        if (from) {
          navigate(from, { replace: true });
        } else if (loggedInUser?.role === 'admin') {
          navigate('/admin/properties', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        
        if (result.fieldErrors) {
          Object.keys(result.fieldErrors).forEach(field => {
            setFieldError(field, result.fieldErrors[field][0]);
          });
        } else {
          setError(result.error);
          
        }
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <LoginIcon sx={{ m: 1, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', p: 1 }} />
          
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <LoginForm onSubmit={handleSubmit} loading={loading} />

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register" variant="body2">
                Sign up here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
