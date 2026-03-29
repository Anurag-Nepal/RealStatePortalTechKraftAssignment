import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stack,
  Paper,
  useTheme,
  alpha 
} from '@mui/material';
import { 
  SearchOff, 
  Home, 
  ArrowBack, 
  Refresh,
  Add,
  Explore,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  actionText,
  actionPath,
  onAction,
  secondaryAction,
  secondaryActionText = "Try Again",
  onSecondaryAction,
  showAction = true,
  showSecondaryAction = false,
  size = 'medium',
  variant = 'default',
  sx = {},
  ...props
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  
  const defaults = {
    noResults: {
      icon: SearchOff,
      title: "No Results Found",
      description: "Try adjusting your search criteria or check back later.",
      actionText: "Browse All Properties",
      actionPath: "/properties"
    },
    noFavorites: {
      icon: () => <Home sx={{ fontSize: 'inherit' }} />,
      title: "No Favorites Yet",
      description: "Start browsing properties and save your favorites to see them here.",
      actionText: "Explore Properties",
      actionPath: "/properties"
    },
    error: {
      icon: SearchOff,
      title: "Something Went Wrong",
      description: "We couldn't load the data. Please try again.",
      actionText: "Retry",
      secondaryActionText: "Go Home",
      showSecondaryAction: true
    },
    offline: {
      icon: SearchOff,
      title: "You're Offline",
      description: "Check your internet connection and try again.",
      actionText: "Retry",
      showSecondaryAction: true
    }
  };

  
  const emptyStateProps = {
    icon: Icon,
    title,
    description,
    actionText,
    actionPath,
    ...defaults[props.type] || {}
  };

  
  const sizeConfig = {
    small: {
      iconSize: { xs: 48, sm: 56 },
      spacing: 3,
      titleVariant: 'h6',
      descriptionVariant: 'body2',
      maxWidth: 300
    },
    medium: {
      iconSize: { xs: 64, sm: 80 },
      spacing: 4,
      titleVariant: 'h5',
      descriptionVariant: 'body1',
      maxWidth: 400
    },
    large: {
      iconSize: { xs: 80, sm: 120 },
      spacing: 6,
      titleVariant: 'h4',
      descriptionVariant: 'body1',
      maxWidth: 500
    }
  };

  const config = sizeConfig[size];

  const handlePrimaryAction = () => {
    if (onAction) {
      onAction();
    } else if (emptyStateProps.actionPath) {
      navigate(emptyStateProps.actionPath);
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      navigate('/');
    }
  };

  const renderIcon = () => {
    const IconComponent = emptyStateProps.icon || SearchOff;
    return (
      <IconComponent
        sx={{
          fontSize: config.iconSize,
          color: 'text.disabled',
          mb: 2,
          opacity: 0.7
        }}
      />
    );
  };

  const renderActions = () => {
    if (action) {
      return action;
    }

    const actions = [];

    if (showAction) {
      actions.push(
        <Button
          key="primary"
          variant="contained"
          onClick={handlePrimaryAction}
          startIcon={getActionIcon(emptyStateProps.actionPath)}
          size={size === 'small' ? 'medium' : 'large'}
          sx={{
            px: 3,
            py: size === 'small' ? 1 : 1.5,
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          {emptyStateProps.actionText}
        </Button>
      );
    }

    if (showSecondaryAction || secondaryAction) {
      actions.push(
        secondaryAction || (
          <Button
            key="secondary"
            variant="outlined"
            onClick={handleSecondaryAction}
            startIcon={<ArrowBack />}
            size={size === 'small' ? 'medium' : 'large'}
            sx={{
              px: 3,
              py: size === 'small' ? 1 : 1.5,
              borderRadius: 2
            }}
          >
            {secondaryActionText}
          </Button>
        )
      );
    }

    return actions.length > 0 ? (
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
        {actions}
      </Stack>
    ) : null;
  };

  const getActionIcon = (path) => {
    if (!path) return <Refresh />;
    
    const iconMap = {
      '/properties': <Explore />,
      '/': <Home />,
      '/dashboard': <TrendingUp />,
      default: <ArrowBack />
    };
    
    return iconMap[path] || iconMap.default;
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: config.spacing,
        px: 3,
        minHeight: size === 'large' ? '50vh' : 'auto',
        ...sx
      }}
    >
      {renderIcon()}
      
      <Typography 
        variant={config.titleVariant}
        component="h3"
        sx={{ 
          fontWeight: 600,
          mb: 1.5,
          color: 'text.primary'
        }}
      >
        {emptyStateProps.title}
      </Typography>
      
      <Typography 
        variant={config.descriptionVariant}
        color="text.secondary"
        sx={{ 
          mb: config.spacing,
          maxWidth: config.maxWidth,
          lineHeight: 1.6
        }}
      >
        {emptyStateProps.description}
      </Typography>

      {renderActions()}
    </Box>
  );

  
  if (variant === 'paper') {
    return (
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          ...sx
        }}
      >
        {content}
      </Paper>
    );
  }

  if (variant === 'outlined') {
    return (
      <Box
        sx={{
          border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
          borderRadius: 2,
          ...sx
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};


export const NoResultsState = (props) => (
  <EmptyState type="noResults" {...props} />
);

export const NoFavoritesState = (props) => (
  <EmptyState type="noFavorites" {...props} />
);

export const ErrorState = (props) => (
  <EmptyState type="error" showSecondaryAction {...props} />
);

export const OfflineState = (props) => (
  <EmptyState type="offline" showSecondaryAction {...props} />
);

export default EmptyState;
