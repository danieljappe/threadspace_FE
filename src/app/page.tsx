'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PostList } from '@/components/posts/PostList';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, PostOrder } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Plus } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            
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
        </div>

        {/* Posts List */}
        <PostList
          search={debouncedSearch || undefined}
          orderBy={orderBy}
        />
      </div>

      <Footer />
    </div>
  );
}