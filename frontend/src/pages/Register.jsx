import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm.jsx';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setLoading(true);
    setError('');

    try {
      
      const result = await register(values, {
        showLoadingToast: false,
        showSuccessToast: false,
      });

      if (result.success) {
        const email = values.email.trim();
        navigate('/verify-email', { replace: true, state: { email } });
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
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', error);
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
          <PersonAddIcon sx={{ m: 1, bgcolor: 'secondary.main', color: 'white', borderRadius: '50%', p: 1 }} />
          
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <RegisterForm onSubmit={handleSubmit} loading={loading} />

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" variant="body2">
                Sign in here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
