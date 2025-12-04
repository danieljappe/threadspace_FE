'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthSessionContextType {
  isSessionExpired: boolean;
  showSessionExpiredModal: () => void;
  hideSessionExpiredModal: () => void;
  onSessionRestored: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(undefined);

// Global event emitter for session expiry (used by Apollo client)
type SessionExpiredListener = () => void;
const sessionExpiredListeners: Set<SessionExpiredListener> = new Set();

export const emitSessionExpired = () => {
  sessionExpiredListeners.forEach(listener => listener());
};

export const subscribeToSessionExpired = (listener: SessionExpiredListener) => {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
};

interface AuthSessionProviderProps {
  children: ReactNode;
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const showSessionExpiredModal = useCallback(() => {
    setIsSessionExpired(true);
  }, []);

  const hideSessionExpiredModal = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  const onSessionRestored = useCallback(() => {
    setIsSessionExpired(false);
    // Optionally refetch active queries after re-authentication
  }, []);

  // Subscribe to global session expired events
  React.useEffect(() => {
    const unsubscribe = subscribeToSessionExpired(() => {
      setIsSessionExpired(true);
    });
    return unsubscribe;
  }, []);

  const value: AuthSessionContextType = {
    isSessionExpired,
    showSessionExpiredModal,
    hideSessionExpiredModal,
    onSessionRestored,
  };

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextType {
  const context = useContext(AuthSessionContext);
  if (context === undefined) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
}

