import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// FireAlert custom theme based on Material Design 3
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary fire alert colors
    primary: '#FF5722', // Fire orange
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFCCBC',
    onPrimaryContainer: '#BF360C',
    
    // Secondary warning colors  
    secondary: '#FFC107', // Warning yellow
    onSecondary: '#000000',
    secondaryContainer: '#FFF8E1',
    onSecondaryContainer: '#FF8F00',
    
    // Error colors
    error: '#F44336',
    onError: '#FFFFFF',
    errorContainer: '#FFEBEE',
    onErrorContainer: '#C62828',
    
    // Surface colors
    surface: '#FFFFFF',
    onSurface: '#212121',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#757575',
    
    // Outline colors
    outline: '#E0E0E0',
    outlineVariant: '#EEEEEE',
    
    // Custom fire risk colors
    fireRisk: {
      low: '#4CAF50',      // Green
      medium: '#FF9800',   // Orange  
      high: '#FF5722',     // Red-orange
      critical: '#D32F2F'  // Dark red
    }
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // Custom font configurations can be added here
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors for dark mode
    primary: '#FF8A65',
    onPrimary: '#000000',
    primaryContainer: '#BF360C',
    onPrimaryContainer: '#FFCCBC',
    
    // Secondary colors for dark mode
    secondary: '#FFD54F',
    onSecondary: '#000000', 
    secondaryContainer: '#FF8F00',
    onSecondaryContainer: '#FFF8E1',
    
    // Surface colors for dark mode
    surface: '#121212',
    onSurface: '#FFFFFF',
    surfaceVariant: '#1E1E1E',
    onSurfaceVariant: '#E0E0E0',
    
    // Custom fire risk colors for dark mode
    fireRisk: {
      low: '#66BB6A',      // Light green
      medium: '#FFA726',   // Light orange
      high: '#FF7043',     // Light red-orange  
      critical: '#EF5350'  // Light red
    }
  }
};

export default lightTheme;