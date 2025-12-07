'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthSession } from '@/contexts/AuthSessionContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoginInput } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import { apolloClient } from '@/lib/apollo-client';
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from 'lucide-react';

export const SessionExpiredModal: React.FC = () => {
  const { login, user, logout } = useAuth();
  const { isSessionExpired, onSessionRestored, hideSessionExpiredModal } = useAuthSession();
  
  const [formData, setFormData] = useState<LoginInput>({
    email: user?.email || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      // Refetch all active queries after successful login
      await apolloClient.refetchQueries({
        include: 'active'
      });
      onSessionRestored();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    hideSessionExpiredModal();
    window.location.href = '/auth/login';
  };

  const isFormValid = formData.email && formData.password;

  if (!isSessionExpired) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Header with warning accent */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Session Expired
                </h3>
                <p className="text-amber-100 text-sm">
                  Please sign in again to continue
                </p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {user && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  You were signed in as:
                </p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">
                  {user.username}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                disabled={loading}
              />

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium"
                  loading={loading}
                  disabled={!isFormValid || loading}
                >
                  Sign In & Continue
                </Button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Sign out and go to login page
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};




