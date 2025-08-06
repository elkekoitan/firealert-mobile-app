import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { errorHandler, ErrorCode, type AppError } from '../../services/errorHandling';
import { monitoringService } from '../../services/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  appError: AppError | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, appError: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = errorHandler.createError(
      ErrorCode.UNKNOWN_ERROR,
      errorHandler.getUserFriendlyMessage(error),
      error,
      { component: 'ErrorBoundary' }
    );
    return { hasError: true, error, appError };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Create app error with context
    const appError = errorHandler.createError(
      ErrorCode.UNKNOWN_ERROR,
      errorHandler.getUserFriendlyMessage(error),
      error,
      { 
        component: 'ErrorBoundary',
        errorInfo,
        stack: error.stack
      }
    );
    
    // Report crash to monitoring service
    monitoringService.reportCrash(error, errorInfo, {
      component: 'ErrorBoundary',
      userAgent: navigator.userAgent,
      url: window?.location?.href,
    });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }
    
    // TODO: Send to crash reporting service (Sentry, Crashlytics, etc.)
    // crashReporter.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, appError: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Surface style={styles.container}>
          <View style={styles.content}>
            <MaterialIcons 
              name="error-outline" 
              size={64} 
              color="#f44336" 
              style={styles.icon}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Bir şeyler yanlış gitti
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              {this.state.appError?.message || 'Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen tekrar deneyin.'}
            </Text>
            <Button
              mode="contained"
              onPress={this.handleReset}
              style={styles.button}
            >
              Tekrar Dene
            </Button>
          </View>
        </Surface>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    minWidth: 120,
  },
});

// Also export as named export for convenience
export { ErrorBoundary };