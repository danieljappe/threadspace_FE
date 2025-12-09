'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { CreatePostInput } from '@/types';
import { CREATE_POST } from '@/graphql/mutations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ROUTES, MAX_LENGTHS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';
import { Type, X } from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSuccess,
  onCancel,
  className
}) => {
  const router = useRouter();
  const [createPost, { loading }] = useMutation(CREATE_POST);
  
  const [formData, setFormData] = useState<CreatePostInput>({
    title: '',
    content: '',
  });
  
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > MAX_LENGTHS.POST_TITLE) {
      errors.title = `Title must be ${MAX_LENGTHS.POST_TITLE} characters or less`;
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.length > MAX_LENGTHS.POST_CONTENT) {
      errors.content = `Content must be ${MAX_LENGTHS.POST_CONTENT} characters or less`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await createPost({
        variables: { input: formData }
      });

      if (data?.createPost) {
        onSuccess?.();
        router.push(ROUTES.POST(data.createPost.id));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const isFormValid = formData.title.trim() && formData.content.trim();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Create New Post</CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              leftIcon={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <Input
            type="text"
            name="title"
            label="Title"
            placeholder="What's your post about?"
            value={formData.title}
            onChange={handleChange}
            leftIcon={<Type className="h-4 w-4" />}
            error={validationErrors.title}
            helperText={`${formData.title.length}/${MAX_LENGTHS.POST_TITLE} characters`}
            required
            disabled={loading}
          />

          {/* Content */}
          <Textarea
            name="content"
            label="Content"
            placeholder="Share your thoughts, ideas, or questions..."
            value={formData.content}
            onChange={handleChange}
            rows={8}
            error={validationErrors.content}
            helperText={`${formData.content.length}/${MAX_LENGTHS.POST_CONTENT} characters`}
            required
            disabled={loading}
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={loading}
              disabled={!isFormValid || loading}
            >
              Create Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
