import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  const initialEmail = location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    initialEmail
      ? `We have sent a 6-digit verification code to ${initialEmail}.`
      : 'Enter the email you used to register and the 6-digit code you received.',
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp/', { email, otp });
      
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.otp || err.response?.data?.detail || 'Verification failed.';
      setError(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email to resend the code.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await api.post('/auth/resend-otp/', { email });
      setInfo(`A new verification code has been sent to ${email}.`);
    } catch (err) {
      const msg =
        err.response?.data?.email || err.response?.data?.detail || 'Failed to resend verification code.';
      setError(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setLoading(false);
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
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Verify Your Email
          </Typography>

          {info && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              {info}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleVerify} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Verification Code"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 6 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
              disabled={loading || !email || !otp}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleResend}
              disabled={loading || !email}
            >
              Resend Code
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
