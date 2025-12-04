'use client';

import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './apollo-client';
import { AuthSessionProvider } from '@/contexts/AuthSessionContext';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthSessionProvider>
        {children}
      </AuthSessionProvider>
    </ApolloProvider>
  );
}
