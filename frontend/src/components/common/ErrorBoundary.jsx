import React from 'react';
import { Box, Typography, Button, Paper, Chip, Alert } from '@mui/material';
import { Error as ErrorIcon, Refresh, Home, BugReport } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      lastError: null
    };
  }

  static getDerivedStateFromError(error) {
    
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    
    if (process.env.NODE_ENV === 'production') {
      
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      lastError: new Date().toISOString()
    });
  }

  handleReload = () => {
    this.setState({ retryCount: this.state.retryCount + 1 });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    
    const errorData = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: this.state.lastError
    };
    
    console.log('Error Report Data:', errorData);
    
    
    navigator.clipboard?.writeText(JSON.stringify(errorData, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => alert('Unable to copy error details'));
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('Network Error') ||
                             this.state.error?.message?.includes('fetch');
      const isChunkError = this.state.error?.message?.includes('Loading chunk') ||
                           this.state.error?.message?.includes('ChunkLoadError');

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            p: 3,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 600,
              width: '100%',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Oops! Something went wrong
            </Typography>
            
            {isNetworkError && (
              <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                <strong>Network Issue Detected</strong><br />
                Please check your internet connection and try again.
              </Alert>
            )}
            
            {isChunkError && (
              <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                <strong>App Update Available</strong><br />
                The application may have been updated. Please refresh to get the latest version.
              </Alert>
            )}
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {isNetworkError 
                ? "We couldn't connect to our servers. Please check your internet connection."
                : isChunkError 
                ? "The app needs to reload to get the latest updates."
                : "We're sorry, but something unexpected happened. Our team has been notified."
              }
            </Typography>

            {this.state.retryCount > 0 && (
              <Chip 
                label={`Retry attempt: ${this.state.retryCount}`} 
                color="warning" 
                size="small" 
                sx={{ mb: 2 }} 
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                size="large"
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
                size="large"
              >
                Go Home
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outlined"
                  startIcon={<BugReport />}
                  onClick={this.handleReportError}
                  size="large"
                  color="warning"
                >
                  Report Issue
                </Button>
              )}
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
                  🐛 Development Error Details:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Error:</Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: '200px',
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {this.state.error.toString()}
                  </Box>
                </Box>

                {this.state.error.stack && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Stack Trace:</Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        backgroundColor: 'grey.200',
                        p: 1,
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: '200px',
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {this.state.error.stack}
                    </Box>
                  </Box>
                )}

                {this.state.errorInfo?.componentStack && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Component Stack:</Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        backgroundColor: 'grey.200',
                        p: 1,
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: '150px',
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {process.env.NODE_ENV === 'production' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Error ID: {this.state.lastError ? btoa(this.state.lastError).slice(-8) : 'unknown'}
              </Typography>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;