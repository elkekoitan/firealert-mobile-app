
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Mock API calls - Bu gerçek uygulamada API servisleri ile değiştirilecek
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      name: 'Test User',
      reliabilityScore: 75,
      totalReports: 12,
      verifiedReports: 9,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    const mockToken = 'mock_jwt_token_' + Date.now();
    
    // Store in secure storage
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, mockToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));

    return { user: mockUser, token: mockToken };
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name, phone }: { 
    email: string; 
    password: string; 
    name: string; 
    phone?: string; 
  }) => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      phone,
      reliabilityScore: 50, // Starting score
      totalReports: 0,
      verifiedReports: 0,
      createdAt: new Date().toISOString(),
      isVerified: false,
    };

    const mockToken = 'mock_jwt_token_' + Date.now();
    
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, mockToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));

    return { user: mockUser, token: mockToken };
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async () => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN);
    const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    
    if (token && userData) {
      return {
        token,
        user: JSON.parse(userData) as User,
      };
    }
    
    throw new Error('No stored auth data');
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Giriş başarısız';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Kayıt başarısız';
      })
      // Load stored
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
