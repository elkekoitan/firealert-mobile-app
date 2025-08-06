import authReducer, { initialState, clearError, updateUser, clearAuth } from './authSlice';

describe('Auth Slice', () => {
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' } as any)).toEqual(initialState);
  });

  it('should handle login success', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      reliabilityScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = 'mock-token';
    const state = authReducer(
      initialState,
      {
        type: 'auth/login/fulfilled',
        payload: { user, token, refreshToken: 'mock-refresh' },
      } as any
    );

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle login failure', () => {
    const error = 'Invalid credentials';
    const state = authReducer(
      initialState,
      { type: 'auth/login/rejected', payload: error } as any
    );

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
  });

  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: '1', email: 'test@example.com', name: 'Test User', avatar: null, reliabilityScore: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      token: 'mock-token',
      isAuthenticated: true,
    };

    const state = authReducer(loggedInState as any, { type: 'auth/logout/fulfilled' } as any);

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle update profile', () => {
    const currentUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      reliabilityScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const loggedInState = {
      ...initialState,
      user: currentUser,
      token: 'mock-token',
      isAuthenticated: true,
    };

    const updatedUser = {
      ...currentUser,
      name: 'Updated User',
      reliabilityScore: 85,
    };

    const state = authReducer(loggedInState as any, updateUser(updatedUser));

    expect(state.user).toEqual(updatedUser);
    expect(state.token).toBe('mock-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle clear error', () => {
    const errorState = {
      ...initialState,
      error: 'Some error',
    };

    const state = authReducer(errorState as any, clearError());

    expect(state.error).toBeNull();
  });

  it('should handle pending login state', () => {
    const state = authReducer(initialState, { type: 'auth/login/pending' } as any);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle pending register state', () => {
    const state = authReducer(initialState, { type: 'auth/register/pending' } as any);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });
});
