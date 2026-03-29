import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';


const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginForm = ({ onSubmit, loading = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const initialValues = {
    email: '',
    password: '',
  };

  
  if (loading && !showPassword) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={48} />
      </Box>
    );
  }

  return (
    <Formik
      enableReinitialize={true} 
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={onSubmit}
    >
        {({ errors, touched, isValid, dirty, isSubmitting }) => (
          <Form noValidate role="form" aria-label="Login form">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field name="email">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    disabled={loading || isSubmitting}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    aria-describedby={meta.touched && meta.error ? "email-error" : undefined}
                    aria-invalid={meta.touched && Boolean(meta.error)}
                    InputProps={{
                      autoComplete: 'email',
                      'aria-label': 'Email address',
                    }}
                    onKeyDown={(e) => {
                      
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const form = e.target.form;
                        const inputs = Array.from(form.querySelectorAll('input'));
                        const index = inputs.indexOf(e.target);
                        if (index < inputs.length - 1) {
                          inputs[index + 1].focus();
                        }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  />
                )}
              </Field>

              <Field name="password">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={loading || isSubmitting}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    aria-describedby={meta.touched && meta.error ? "password-error" : undefined}
                    aria-invalid={meta.touched && Boolean(meta.error)}
                    InputProps={{
                      autoComplete: 'current-password',
                      'aria-label': 'Password',
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={`${showPassword ? 'Hide' : 'Show'} password`}
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={loading || isSubmitting}
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()} 
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onKeyDown={(e) => {
                      
                      if (e.key === 'Enter' && isValid && dirty && !loading && !isSubmitting) {
                        e.preventDefault();
                        e.target.form.requestSubmit();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  />
                )}
              </Field>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || isSubmitting || !(isValid && dirty)}
                startIcon={
                  loading || isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <LoginIcon />
                  )
                }
                aria-label={loading || isSubmitting ? 'Signing in, please wait' : 'Sign in to your account'}
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: loading || isSubmitting ? 'none' : 'translateY(-1px)',
                    boxShadow: loading || isSubmitting ? 'none' : '0 4px 8px rgba(0,0,0,0.12)',
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  }
                }}
              >
                {loading || isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
  );
};

export default LoginForm;