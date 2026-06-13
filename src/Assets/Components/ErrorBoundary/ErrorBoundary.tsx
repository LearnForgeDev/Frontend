import { Component, type ErrorInfo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styles } from './ErrorBoundary.styles';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types';
import { ERROR_BOUNDARY_DEFAULTS } from './ErrorBoundary.const';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <Box sx={styles.container}>
          <Typography variant="h5" component="h2" sx={styles.title}>
            {ERROR_BOUNDARY_DEFAULTS.defaultTitle}
          </Typography>
          <Typography variant="body1" sx={styles.message}>
            {this.state.error?.message || ERROR_BOUNDARY_DEFAULTS.defaultMessage}
          </Typography>
          <Button variant="contained" onClick={this.handleRetry} sx={styles.button}>
            {ERROR_BOUNDARY_DEFAULTS.retryButtonText}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
