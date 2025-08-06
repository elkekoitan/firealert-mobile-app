import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Here you would typically log to Sentry or other error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
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
              Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen tekrar deneyin.
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