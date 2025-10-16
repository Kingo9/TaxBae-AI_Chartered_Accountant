import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';

// Action types
type AuthAction =
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; payload: string };

// Initial state
const initialState: AuthState & { error?: string } = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: undefined,
};

// Auth reducer
const authReducer = (state: typeof initialState, action: AuthAction): typeof initialState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: undefined };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: undefined,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
      };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

// Context type
interface AuthContextType extends AuthState {
  error?: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, userType: 'individual' | 'corporate', phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: 'taxbae_user',
  TOKEN: 'taxbae_token',
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [userStr, token] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);

      if (userStr && token) {
        const user: User = JSON.parse(userStr);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOADING' });

      // TESTING MODE: Bypass backend authentication
      // Comment out the next line and uncomment the backend code when ready to connect
      
      // Simulate a successful login with mock user data
      const mockUser: User = {
        id: 'test-user-id',
        email: email,
        name: 'Test User',
        userType: 'individual',
        phone: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockToken = 'mock-jwt-token-for-testing';
      
      // Store mock user data and token
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, mockToken),
      ]);
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
      
      /* BACKEND CODE (uncomment when ready to use real backend):
      const response = await fetch('http://192.168.0.119:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user, token } = data.data;

      // Store user data and token
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      */
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'ERROR', payload: error.message || 'Invalid email or password' });
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    userType: 'individual' | 'corporate',
    phone?: string
  ) => {
    try {
      dispatch({ type: 'LOADING' });

      // TESTING MODE: Bypass backend registration
      // Comment out the next section and uncomment the backend code when ready to connect
      
      // Simulate a successful registration with mock user data
      const mockUser: User = {
        id: 'test-user-id',
        email: email,
        name: name,
        userType: userType,
        phone: phone || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockToken = 'mock-jwt-token-for-testing';
      
      // Store mock user data and token
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, mockToken),
      ]);
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
      
      /* BACKEND CODE (uncomment when ready to use real backend):
      const response = await fetch('http://192.168.0.119:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          userType: userType.toUpperCase(), 
          phone 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const { user, token } = data.data;

      // Store user data and token
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      */
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'ERROR', payload: error.message || 'Registration failed. Please try again.' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      ]);

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'ERROR', payload: 'Logout failed' });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
