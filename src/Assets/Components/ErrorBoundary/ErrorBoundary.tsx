import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styles } from './ErrorBoundary.styles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
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
            Что-то пошло не так
          </Typography>
          <Typography variant="body1" sx={styles.message}>
            {this.state.error?.message || 'Произошла непредвиденная ошибка.'}
          </Typography>
          <Button variant="contained" onClick={this.handleRetry} sx={styles.button}>
            Повторить попытку
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
