import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Skeleton,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';


const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterForm = ({ onSubmit, loading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleToggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    password_confirm: '',
  };

  
  const getPasswordRequirements = useMemo(() => (password) => [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) }
  ], []);

  
  if (loading && !showPassword && !showConfirmPassword) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
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
      validationSchema={registerSchema}
      onSubmit={onSubmit}
    >
        {({ errors, touched, isValid, dirty, values, isSubmitting }) => (
          <Form noValidate role="form" aria-label="Registration form">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field name="name">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    type="text"
                    autoComplete="name"
                    autoFocus
                    disabled={loading || isSubmitting}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    InputProps={{
                      autoComplete: 'name',
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  />
                )}
              </Field>

              <Field name="email">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    disabled={loading || isSubmitting}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    InputProps={{
                      autoComplete: 'email',
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
                    autoComplete="new-password"
                    disabled={loading || isSubmitting}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    InputProps={{
                      autoComplete: 'new-password',
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={loading || isSubmitting}
                            tabIndex={-1}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  />
                )}
              </Field>

              <Field name="password_confirm">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={loading || isSubmitting}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                    InputProps={{
                      autoComplete: 'new-password',
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge="end"
                            disabled={loading || isSubmitting}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  />
                )}
              </Field>

            {values.password && (
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Password Requirements
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {getPasswordRequirements(values.password).map((req, index) => (
                    <Typography 
                      key={index}
                      variant="caption" 
                      color={req.valid ? 'success.main' : 'text.secondary'}
                    >
                      ✓ {req.label}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

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
                    <PersonAddIcon />
                  )
                }
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: loading || isSubmitting ? 'none' : 'translateY(-1px)',
                    boxShadow: loading || isSubmitting ? 'none' : '0 4px 8px rgba(0,0,0,0.12)',
                  }
                }}
              >
                {loading || isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
  );
};

export default RegisterForm;