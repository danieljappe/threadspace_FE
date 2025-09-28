'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { CreatePostInput, ThreadType, Topic } from '@/types';
import { CREATE_POST } from '@/graphql/mutations';
import { GET_TOPICS } from '@/graphql/queries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ROUTES, MAX_LENGTHS, ERROR_MESSAGES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';
import { 
  Hash, 
  Type, 
  MessageSquare, 
  Megaphone, 
  BarChart3,
  X
} from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialTopicId?: string;
  className?: string;
}

const threadTypeOptions = [
  {
    value: ThreadType.DISCUSSION,
    label: 'Discussion',
    description: 'Start a conversation about a topic',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  {
    value: ThreadType.QUESTION,
    label: 'Question',
    description: 'Ask for help or advice',
    icon: Hash,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  {
    value: ThreadType.ANNOUNCEMENT,
    label: 'Announcement',
    description: 'Share important news or updates',
    icon: Megaphone,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  {
    value: ThreadType.POLL,
    label: 'Poll',
    description: 'Create a poll to gather opinions',
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
];

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSuccess,
  onCancel,
  initialTopicId,
  className
}) => {
  const router = useRouter();
  const [createPost, { loading }] = useMutation(CREATE_POST);
  
  // Fetch topics from the database
  const { data: topicsData, loading: topicsLoading, error: topicsError } = useQuery(GET_TOPICS, {
    variables: { first: 50 }
  });
  
  const [formData, setFormData] = useState<CreatePostInput>({
    title: '',
    content: '',
    threadType: ThreadType.DISCUSSION,
    topicIds: initialTopicId ? [initialTopicId] : []
  });
  
  const [selectedTopics, setSelectedTopics] = useState<string[]>(formData.topicIds);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Get topics from the query result
  const topics: Topic[] = topicsData?.topics?.edges?.map((edge: any) => edge.node) || [];

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

  const handleThreadTypeChange = (threadType: ThreadType) => {
    setFormData(prev => ({
      ...prev,
      threadType
    }));
  };

  const handleTopicToggle = (topicId: string) => {
    const newTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId];
    
    setSelectedTopics(newTopics);
    setFormData(prev => ({
      ...prev,
      topicIds: newTopics
    }));
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

    // Topics are now optional - no validation required

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

          {/* Thread Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Post Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {threadTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleThreadTypeChange(option.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.threadType === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <option.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

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

          {/* Topics Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Topics (Optional)
            </label>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select topics to help others find your post (optional)
              </p>
              {topicsLoading ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading topics...
                </div>
              ) : topicsError ? (
                <div className="text-sm text-red-600 dark:text-red-400">
                  Error loading topics. Please try again.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTopics.includes(topic.id)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => handleTopicToggle(topic.id)}
                      style={topic.color ? { borderLeft: `3px solid ${topic.color}` } : {}}
                    >
                      #{topic.name}
                    </button>
                  ))}
                </div>
              )}
              {validationErrors.topics && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.topics}
                </p>
              )}
            </div>
          </div>

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
