import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress, 
  LinearProgress,
  Typography, 
  Backdrop,
  Skeleton,
  Stack,
  Fade,
  keyframes
} from '@mui/material';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;


const Loader = ({ 
  size = 'medium',
  message = 'Loading...',
  fullPage = false,
  overlay = false,
  variant = 'circular',
  color = 'primary',
  delay = 0,
  showMessage = true,
  minHeight = '200px',
  sx = {},
  ...props
}) => {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!visible) {
    return null;
  }

  const getSizeConfig = () => {
    if (typeof size === 'number') {
      return { size, fontSize: 'body2' };
    }

    const configs = {
      small: { size: 24, fontSize: 'caption' },
      medium: { size: 40, fontSize: 'body2' },
      large: { size: 56, fontSize: 'body1' }
    };

    return configs[size] || configs.medium;
  };

  const sizeConfig = getSizeConfig();

  const renderLoader = () => {
    switch (variant) {
      case 'linear':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress color={color} />
            {showMessage && (
              <Typography 
                variant={sizeConfig.fontSize} 
                color="text.secondary" 
                align="center"
                sx={{ mt: 2 }}
              >
                {message}
              </Typography>
            )}
          </Box>
        );

      case 'dots':
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: `${color}.main`,
                  borderRadius: '50%',
                  animation: `${pulse} 1.4s ease-in-out ${index * 0.2}s infinite both`,
                }}
              />
            ))}
            {showMessage && (
              <Typography 
                variant={sizeConfig.fontSize} 
                color="text.secondary"
                sx={{ ml: 2 }}
              >
                {message}
              </Typography>
            )}
          </Stack>
        );

      case 'skeleton':
        return (
          <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="80%" />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
          </Stack>
        );

       default:
        return (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress 
              size={sizeConfig.size} 
              color={color}
              {...props}
            />
            {showMessage && (
              <Typography 
                variant={sizeConfig.fontSize} 
                color="text.secondary"
                align="center"
              >
                {message}
              </Typography>
            )}
          </Stack>
        );
    }
  };

  const getContainerStyles = () => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx
    };

    if (fullPage) {
      return {
        ...baseStyles,
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bgcolor: 'background.default'
      };
    }

    if (overlay) {
      return {
        ...baseStyles,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000
      };
    }

    return {
      ...baseStyles,
      minHeight,
      p: 3
    };
  };

  const content = (
    <Fade in={visible} timeout={300}>
      <Box sx={getContainerStyles()}>
        {renderLoader()}
      </Box>
    </Fade>
  );

  if (overlay && !fullPage) {
    return (
      <Backdrop
        open={true}
        sx={{
          position: 'absolute',
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.8)'
        }}
      >
        {renderLoader()}
      </Backdrop>
    );
  }

  return content;
};

export const FullPageLoader = ({ message = "Loading application...", ...props }) => (
  <Loader fullPage message={message} size="large" {...props} />
);

export const OverlayLoader = ({ message = "Processing...", ...props }) => (
  <Loader overlay message={message} {...props} />
);

export const InlineLoader = ({ message = "Loading...", ...props }) => (
  <Loader showMessage={false} size="small" {...props} />
);

export const SkeletonLoader = ({ ...props }) => (
  <Loader variant="skeleton" showMessage={false} {...props} />
);

export const DotsLoader = ({ message = "Loading...", ...props }) => (
  <Loader variant="dots" message={message} {...props} />
);

export default Loader;
