# 🔥 FireAlert Mobile App - AI Rules & Tech Stack

## Tech Stack Overview

- **React Native 0.79.5** - Cross-platform mobile framework for iOS/Android
- **TypeScript 5.8.3** - Type-safe JavaScript for better development experience
- **Redux Toolkit** - State management for complex app state
- **React Navigation** - Navigation between screens and tabs
- **Expo SDK 53** - Development platform with pre-built native modules
- **NASA FIRMS API** - Real-time satellite fire detection data
- **Supabase** - Backend-as-a-service for auth, database, and real-time features
- **Socket.io** - Real-time bidirectional communication for live updates

## Library Usage Rules

### Navigation & Routing
- **@react-navigation/native** - Primary navigation library
- **@react-navigation/bottom-tabs** - Bottom tab navigation for main screens
- **@react-navigation/native-stack** - Stack navigation for screen transitions
- **@react-navigation/stack** - Additional stack navigation options

### State Management
- **@reduxjs/toolkit** - ONLY state management library allowed
- **react-redux** - React bindings for Redux
- Store structure: `src/store/slices/` for feature-specific slices
- NEVER use Context API for global state

### UI & Styling
- **react-native-paper** - Material Design components
- **react-native-vector-icons** - Icon library
- **expo-linear-gradient** - Gradient backgrounds
- **StyleSheet.create()** - For component-specific styles
- NO external UI libraries beyond these approved ones

### Data Fetching
- **axios** - HTTP client for API calls
- **@supabase/supabase-js** - Supabase client (when added)
- **socket.io-client** - Real-time data updates
- NASA FIRMS API endpoints in `src/services/nasaApi.ts`

### Device Features
- **expo-location** - GPS and location services
- **expo-camera** - Camera access for fire reporting
- **expo-image-picker** - Photo selection from gallery
- **expo-notifications** - Push notifications
- **expo-secure-store** - Secure storage for tokens
- **expo-av** - Audio/video playback

### Form Handling
- **react-hook-form** - Form validation and handling
- Native TextInput for basic inputs
- react-native-paper components for styled forms

### Maps & Location
- **react-native-maps** - Map integration
- OpenStreetMap tiles (free tier)
- Custom markers for fire reports

### Date & Time
- **date-fns** - Date manipulation and formatting
- Turkish locale as default (`tr-TR`)

### Security
- **expo-secure-store** - Token storage
- **jwt-decode** - JWT token parsing
- NO custom encryption implementations

### API Configuration
- Base URL: `https://firms.modaps.eosdis.nasa.gov/api/`
- JWT token stored in `src/utils/apiConfig.ts`
- All API calls wrapped in try-catch blocks

### File Structure Rules
- `src/components/` - Reusable UI components
- `src/screens/` - App screens/pages
- `src/store/slices/` - Redux slices
- `src/services/` - API service files
- `src/utils/` - Helper functions
- `src/types/` - TypeScript type definitions
- `src/constants/` - App constants and configuration

### Performance Guidelines
- Use React.memo() for expensive components
- Implement proper loading states
- Debounce search inputs (use src/utils/debounce)
- Lazy load heavy components
- Optimize images with expo-image

### Error Handling
- Always show user-friendly error messages
- Log errors to console in development
- Use try-catch for all async operations
- Implement proper error boundaries

### Testing Requirements
- Write unit tests for utility functions
- Test API integration thoroughly
- Test on both iOS and Android devices
- Test offline functionality

### Security Best Practices
- NEVER store sensitive data in AsyncStorage
- Use expo-secure-store for tokens
- Validate all user inputs
- Implement proper authentication flow
- Use HTTPS for all API calls

### Deployment Rules
- Test on physical devices before release
- Optimize bundle size with Metro config
- Configure app.json properly
- Set up proper app signing
- Test push notifications on production

### Code Style
- Use TypeScript for all new files
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep components under 200 lines