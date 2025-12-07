'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Menu } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden mb-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </aside>

            {/* Mobile Sidebar */}
            {showSidebar && (
              <div className="lg:hidden fixed inset-0 z-50">
                <Sidebar 
                  isOpen={showSidebar} 
                  onClose={() => setShowSidebar(false)} 
                />
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
