## Additional Development Guidelines

### Component Architecture Rules
- **Single Responsibility Principle**: Each component must have one clear purpose
- **Maximum 200 lines per component**: Refactor immediately if exceeded
- **Props Interface Definition**: Always define TypeScript interfaces for component props
- **Default Props**: Use default parameters instead of defaultProps for functional components
- **Memoization**: Use React.memo() for components that receive stable props

### State Management Best Practices
- **Local vs Global State**: Use local state for UI-only data, Redux for app-wide state
- **Async State**: Use createAsyncThunk for all async operations
- **Loading States**: Always implement proper loading, error, and empty states
- **Optimistic Updates**: Use optimistic updates for better UX, with rollback on error
- **State Normalization**: Normalize complex state structures using createEntityAdapter

### API Integration Rules
- **Service Layer**: All API calls must go through services in `src/services/`
- **Error Boundaries**: Wrap all API calls with proper error handling
- **Retry Logic**: Implement exponential backoff for failed requests
- **Caching Strategy**: Use RTK Query or custom caching for frequently accessed data
- **Offline Support**: Implement offline queue for critical operations

### Security Implementation
- **Input Validation**: Validate all user inputs on both client and server
- **XSS Prevention**: Never use dangerouslySetInnerHTML
- **CSRF Protection**: Include CSRF tokens for state-changing operations
- **Rate Limiting**: Implement client-side rate limiting for API calls
- **Sensitive Data**: Never log sensitive information

### Performance Optimization
- **Image Optimization**: Use expo-image with proper sizing and caching
- **Bundle Splitting**: Implement code splitting for large features
- **Memory Management**: Clean up subscriptions and timers in useEffect
- **List Performance**: Use FlatList with proper keyExtractor and getItemLayout
- **Animation Performance**: Use nativeDriver for all animations

### Testing Strategy
- **Unit Tests**: Write tests for all utility functions and hooks
- **Component Tests**: Use React Native Testing Library for component tests
- **Integration Tests**: Test complete user flows with Detox
- **Snapshot Tests**: Use sparingly, only for critical UI components
- **Coverage**: Maintain minimum 80% test coverage

### Accessibility Requirements
- **Screen Reader Support**: All interactive elements must have accessibility labels
- **Color Contrast**: Maintain WCAG 2.1 AA compliance for all colors
- **Touch Targets**: Minimum 44x44px touch targets for all interactive elements
- **Keyboard Navigation**: Support keyboard navigation on all screens
- **Dynamic Type**: Support iOS Dynamic Type for text sizing

### Internationalization (i18n)
- **Default Language**: Turkish (tr-TR) as primary, English (en-US) as fallback
- **Translation Keys**: Use meaningful keys, not English strings
- **Pluralization**: Handle plural forms correctly using i18next
- **RTL Support**: Prepare for potential RTL language support
- **Date/Time**: Use locale-aware formatting with date-fns

### Monitoring & Analytics
- **Error Tracking**: Implement Sentry for error monitoring
- **Performance Monitoring**: Track app startup time and screen transitions
- **User Analytics**: Use privacy-focused analytics (no personal data)
- **Crash Reporting**: Automatic crash reporting with user consent
- **Feature Flags**: Use feature flags for gradual rollouts

### Code Review Checklist
- [ ] No console.log statements in production code
- [ ] All TODO comments have corresponding GitHub issues
- [ ] No hardcoded strings (use constants)
- [ ] Proper error handling for all async operations
- [ ] Accessibility labels for all interactive elements
- [ ] Responsive design tested on multiple screen sizes
- [ ] Dark mode support implemented
- [ ] Performance impact assessed
- [ ] Security implications reviewed
- [ ] Documentation updated

### Git Workflow
- **Branch Naming**: feature/description, bugfix/description, hotfix/description
- **Commit Messages**: Use conventional commits format
- **Pull Requests**: Require at least one approval
- **Code Reviews**: Focus on logic, performance, and security
- **Merge Strategy**: Squash and merge for clean history

### Environment Management
- **Environment Variables**: Use .env files for configuration
- **API Keys**: Never commit API keys to repository
- **Feature Flags**: Use remote config for feature toggles
- **Build Variants**: Separate staging and production configurations
- **Secrets Management**: Use Expo Secrets for sensitive data

### Documentation Standards
- **README Updates**: Update README for any new major features
- **API Documentation**: Document all API endpoints and data structures
- **Component Docs**: Include usage examples for complex components
- **Architecture Decisions**: Document major architectural decisions in ADRs
- **Onboarding Guide**: Maintain up-to-date setup instructions

### Deployment Pipeline
- **Automated Testing**: Run tests on every PR
- **Code Quality**: Use ESLint and Prettier checks
- **Security Scanning**: Run security audits before deployment
- **Performance Budget**: Monitor bundle size and performance metrics
- **Rollback Plan**: Always have a rollback strategy for deployments