'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useMutation } from '@apollo/client/react';
import { User, AuthPayload, LoginInput, RegisterInput } from '@/types';
import { LOGIN, REGISTER, LOGOUT, REFRESH_TOKEN } from '@/graphql/mutations';
import { GET_ME } from '@/graphql/queries';
import { apolloClient, clearApolloCache } from '@/lib/apollo-client';
import { setAuthTokens, clearAuthTokens, isAuthenticated, needsRefresh } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthPayload>;
  register: (input: RegisterInput) => Promise<AuthPayload>;
  logout: () => void;
  refreshToken: () => Promise<AuthPayload>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN);

  const checkAuthStatus = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      if (needsRefresh()) {
        await refreshToken();
      } else {
        const { data } = await apolloClient.query({
          query: GET_ME,
          fetchPolicy: 'cache-first'
        });
        
        if (data?.me) {
          setUser(data.me);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (input: LoginInput): Promise<AuthPayload> => {
    const { data } = await loginMutation({
      variables: { input }
    });

    if (data?.login) {
      const { accessToken, refreshToken, user } = data.login;
      setAuthTokens({ accessToken, refreshToken });
      setUser(user);
      
      await apolloClient.refetchQueries({
        include: 'active'
      });
    }

    return data.login;
  };

  const register = async (input: RegisterInput): Promise<AuthPayload> => {
    const { data } = await registerMutation({
      variables: { input }
    });

    if (data?.register) {
      const { accessToken, refreshToken, user } = data.register;
      setAuthTokens({ accessToken, refreshToken });
      setUser(user);
      
      await apolloClient.refetchQueries({
        include: 'active'
      });
    }

    return data.register;
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout mutation failed:', error);
    } finally {
      clearAuthTokens();
      setUser(null);
      clearApolloCache();
    }
  };

  const refreshToken = async (): Promise<AuthPayload> => {
    try {
      const { data } = await refreshTokenMutation();
      
      if (data?.refreshToken) {
        const { accessToken, refreshToken, user } = data.refreshToken;
        setAuthTokens({ accessToken, refreshToken });
        setUser(user);
        return data.refreshToken;
      }
      
      throw new Error('No refresh token data received');
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
