'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '@/hooks/useAuth';
import { CREATE_COMMENT } from '@/graphql/mutations';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { MAX_LENGTHS, ERROR_MESSAGES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';
import { Send, X } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = 'Write a comment...',
  className
}) => {
  const { user } = useAuth();
  const [createComment, { loading }] = useMutation(CREATE_COMMENT);
  
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (validationError) setValidationError('');
  };

  const validateForm = (): boolean => {
    if (!content.trim()) {
      setValidationError('Comment cannot be empty');
      return false;
    }
    
    if (content.length > MAX_LENGTHS.COMMENT_CONTENT) {
      setValidationError(`Comment must be ${MAX_LENGTHS.COMMENT_CONTENT} characters or less`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await createComment({
        variables: {
          input: {
            postId,
            parentId,
            content: content.trim()
          }
        }
      });

      if (data?.createComment) {
        setContent('');
        onSuccess?.();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    setValidationError('');
    onCancel?.();
  };

  const isFormValid = content.trim() && content.length <= MAX_LENGTHS.COMMENT_CONTENT;

  if (!user) {
    return (
      <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <p>Please log in to leave a comment.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start space-x-3">
        <Avatar user={user} size="sm" />
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <Textarea
              value={content}
              onChange={handleChange}
              placeholder={placeholder}
              rows={3}
              error={validationError}
              helperText={`${content.length}/${MAX_LENGTHS.COMMENT_CONTENT} characters`}
              disabled={loading}
              className="resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {parentId ? 'Replying to comment' : 'Posting as '}
                {!parentId && (
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  loading={loading}
                  disabled={!isFormValid || loading}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  {parentId ? 'Reply' : 'Comment'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
