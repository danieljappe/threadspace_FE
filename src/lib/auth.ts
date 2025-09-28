'use client';

import { STORAGE_KEYS } from './constants';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const getAuthTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  
  if (!accessToken || !refreshToken) return null;
  
  return { accessToken, refreshToken };
};

export const setAuthTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
};

export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const isAuthenticated = (): boolean => {
  const tokens = getAuthTokens();
  if (!tokens) return false;
  
  return !isTokenExpired(tokens.accessToken);
};

export const needsRefresh = (): boolean => {
  const tokens = getAuthTokens();
  if (!tokens) return false;
  
  return isTokenExpired(tokens.accessToken) && !isTokenExpired(tokens.refreshToken);
};
