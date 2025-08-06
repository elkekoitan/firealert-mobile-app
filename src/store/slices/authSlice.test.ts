import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  loadStoredAuth,
  logoutUser,
  clearError,
  updateUser,
  AuthState,
} from '../slices/authSlice';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('Auth Slice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have the initial state', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('loginUser', () => {
    it('should handle login pending', () => {
      const action = { type: loginUser.pending.type };
      const state = authReducer(undefined, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle login fulfilled', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        reliabilityScore: 75,
        totalReports: 12,
        verifiedReports: 9,
        createdAt: new Date().toISOString(),
        isVerified: true,
      };

      const mockToken = 'mock_token_123';
      
      // Mock SecureStore
      mockSecureStore.setItemAsync
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      const action = loginUser.fulfilled(
        { user: mockUser, token: mockToken },
        loginUser.fulfilled.type,
        { email: 'test@example.com', password: 'password123' }
      );

      const state = authReducer(undefined, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle login rejected', () => {
      const action = loginUser.rejected(
        new Error('Login failed'),
        loginUser.rejected.type,
        { email: 'test@example.com', password: 'password123' }
      );

      const state = authReducer(undefined, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('registerUser', () => {
    it('should handle register fulfilled', async () => {
      const mockUser = {
        id: '2',
        email: 'newuser@example.com',
        name: 'New User',
        phone: '+905551234567',
        reliabilityScore: 50,
        totalReports: 0,
        verifiedReports: 0,
        createdAt: new Date().toISOString(),
        isVerified: false,
      };

      const mockToken = 'mock_token_new';
      
      // Mock SecureStore
      mockSecureStore.setItemAsync
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      const action = registerUser.fulfilled(
        { user: mockUser, token: mockToken },
        registerUser.fulfilled.type,
        {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          phone: '+905551234567',
        }
      );

      const state = authReducer(undefined, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('loadStoredAuth', () => {
    it('should handle loadStoredAuth fulfilled', async () => {
      const mockUser = {
        id: '1',
        email: 'stored@example.com',
        name: 'Stored User',
        reliabilityScore: 80,
        totalReports: 15,
        verifiedReports: 12,
        createdAt: new Date().toISOString(),
        isVerified: true,
      };

      const mockToken = 'stored_token_123';
      
      // Mock SecureStore
      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      const action = loadStoredAuth.fulfilled(
        { user: mockUser, token: mockToken },
        loadStoredAuth.fulfilled.type
      );

      const state = authReducer(undefined, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loadStoredAuth rejected', () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);

      const action = loadStoredAuth.rejected(
        new Error('No stored auth data'),
        loadStoredAuth.rejected.type
      );

      const state = authReducer(undefined, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('No stored auth data');
    });
  });

  describe('logoutUser', () => {
    it('should handle logout fulfilled', async () => {
      // Mock SecureStore
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const initialState: AuthState = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock_token',
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

      const action = logoutUser.fulfilled(undefined, logoutUser.fulfilled.type);

      const state = authReducer(initialState, action);
      
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Some error',
      };

      const action = clearError();
      const state = authReducer(initialState, action);
      
      expect(state.error).toBe(null);
    });
  });

  describe('updateUser', () => {
    it('should update user data', () => {
      const initialState: AuthState = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          reliabilityScore: 75,
          totalReports: 12,
          verifiedReports: 9,
          createdAt: new Date().toISOString(),
          isVerified: true,
        },
        token: 'mock_token',
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

      const action = updateUser({
        name: 'Updated User',
        reliabilityScore: 80,
      });

      const state = authReducer(initialState, action);
      
      expect(state.user?.name).toBe('Updated User');
      expect(state.user?.reliabilityScore).toBe(80);
      expect(state.user?.email).toBe('test@example.com'); // Should remain unchanged
    });

    it('should not update if user is null', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };

      const action = updateUser({
        name: 'Updated User',
      });

      const state = authReducer(initialState, action);
      
      expect(state.user).toBe(null);
    });
  });
});