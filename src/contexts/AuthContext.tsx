'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, businessName: string, businessType: string, role: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'upsell_agent_token';
const USER_KEY = 'upsell_agent_user';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (!token || !savedUser) {
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Verify token is still valid by making a request to protected endpoint
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUser(userData);
      } else {
        // Token is invalid, clear auth data
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenExpiry = async () => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return;

    try {
      // Parse JWT token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Refresh token if it expires within threshold
      if (payload.exp - currentTime < REFRESH_THRESHOLD / 1000) {
        await refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
      logout();
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store auth data
      Cookies.set(TOKEN_KEY, data.token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/materials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    businessName: string, 
    businessType: string, 
    role: string
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          businessName, 
          businessType, 
          role 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store auth data
      Cookies.set(TOKEN_KEY, data.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/materials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    router.push('/login');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        
        Cookies.set(TOKEN_KEY, data.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const clearAuthData = () => {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="loading-spinner">
          <div className="loading-spinner__icon">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
          <span>Loading...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Hook for role-based access control
export function useRequireAuth(requiredRole?: string) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user?.role === 'manager') {
          router.push('/dashboard');
        } else {
          router.push('/materials');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  return { user, isAuthenticated, isLoading };
}