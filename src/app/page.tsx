'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostList } from '@/components/posts/PostList';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, PostOrder } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the debounced value
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar />
          </div>

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
          <div className="flex-1 min-w-0">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome to ThreadSpace
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Discover and participate in meaningful discussions
                  </p>
                </div>
                
                {user && (
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="hidden sm:flex"
                    onClick={() => window.location.href = ROUTES.CREATE_POST}
                  >
                    Create Post
                  </Button>
                )}
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search posts, users, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full"
                  />
                </form>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value as PostOrder)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={PostOrder.NEWEST}>Newest</option>
                    <option value={PostOrder.TRENDING}>Trending</option>
                    <option value={PostOrder.TOP}>Top</option>
                    <option value={PostOrder.OLDEST}>Oldest</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Filter className="h-4 w-4" />}
                    className="lg:hidden"
                    onClick={() => setShowSidebar(true)}
                  >
                    Topics
                  </Button>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <PostList
              search={debouncedSearch || undefined}
              orderBy={orderBy}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}