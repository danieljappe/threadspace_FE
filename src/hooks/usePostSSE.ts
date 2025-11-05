'use client';

import { useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';

interface VoteUpdate {
  targetId: string;
  targetType: string;
  voteCount: number;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
}

interface CommentUpdate {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  postId: string;
  parentId?: string | null;
  depth?: number;
  createdAt: string;
}

interface CommentDeletedUpdate {
  id: string;
  postId: string;
  parentId?: string | null;
}

interface SSEEvent {
  type: 'connected' | 'voteUpdated' | 'commentAdded' | 'commentDeleted' | 'error';
  data?: VoteUpdate | CommentUpdate | CommentDeletedUpdate;
  postId?: string;
  error?: string;
}

interface UsePostSSEOptions {
  postId: string;
  onVoteUpdate?: (update: VoteUpdate) => void;
  onCommentAdded?: (comment: CommentUpdate) => void;
  onCommentDeleted?: (comment: CommentDeletedUpdate) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function usePostSSE({ postId, onVoteUpdate, onCommentAdded, onCommentDeleted, onError, enabled = true }: UsePostSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isInitializingRef = useRef(false);
  
  // Store callbacks in refs to avoid re-creating the connection when they change
  const onVoteUpdateRef = useRef(onVoteUpdate);
  const onCommentAddedRef = useRef(onCommentAdded);
  const onCommentDeletedRef = useRef(onCommentDeleted);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onVoteUpdateRef.current = onVoteUpdate;
    onCommentAddedRef.current = onCommentAdded;
    onCommentDeletedRef.current = onCommentDeleted;
    onErrorRef.current = onError;
  }, [onVoteUpdate, onCommentAdded, onCommentDeleted, onError]);

  useEffect(() => {
    if (!enabled || !postId) {
      console.log('[SSE] Hook disabled or no postId:', { enabled, postId });
      return;
    }

    // Prevent double initialization in React Strict Mode
    if (isInitializingRef.current || eventSourceRef.current) {
      console.log('[SSE] Already initializing or connected, skipping');
      return;
    }

    isInitializingRef.current = true;
    console.log('[SSE] Initializing SSE connection for post:', postId);

    // Get auth token
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const baseUrl = API_ENDPOINTS.GRAPHQL.replace('/graphql', '');
    const url = token 
      ? `${baseUrl}/api/posts/${postId}/events?token=${encodeURIComponent(token)}`
      : `${baseUrl}/api/posts/${postId}/events`;

    console.log('[SSE] Connecting to:', url);
    console.log('[SSE] Token present:', !!token);

    // Create EventSource
    // Note: EventSource doesn't support custom headers, so we use query param for auth
    console.log('[SSE] Creating EventSource...');
    const eventSource = new EventSource(url);
    console.log('[SSE] EventSource created, initial readyState:', eventSource.readyState);

    eventSourceRef.current = eventSource;

    // Set up event handlers immediately
    eventSource.onopen = () => {
      console.log('[SSE] ✓✓✓ Connection opened successfully for post:', postId);
      console.log('[SSE] EventSource readyState:', eventSource.readyState, '(1=OPEN)');
      console.log('[SSE] EventSource URL:', eventSource.url);
      isInitializingRef.current = false;
      setIsConnected(true);
      setError(null);
    };
    
    // Also check connection state after delays to track progress
    setTimeout(() => {
      console.log('[SSE] Connection state check after 500ms:', {
        readyState: eventSource.readyState,
        url: eventSource.url,
        CONNECTING: EventSource.CONNECTING,
        OPEN: EventSource.OPEN,
        CLOSED: EventSource.CLOSED,
        isOpen: eventSource.readyState === EventSource.OPEN
      });
    }, 500);
    
    setTimeout(() => {
      console.log('[SSE] Connection state check after 2s:', {
        readyState: eventSource.readyState,
        isOpen: eventSource.readyState === EventSource.OPEN,
        isConnecting: eventSource.readyState === EventSource.CONNECTING,
        isClosed: eventSource.readyState === EventSource.CLOSED
      });
    }, 2000);

    eventSource.onmessage = (event) => {
      console.log('[SSE] 📨 Message received!', {
        type: event.type,
        data: event.data,
        origin: event.origin,
        lastEventId: event.lastEventId
      });
      console.log('[SSE] Raw event object:', event);
      
      // Handle heartbeat (comments starting with :)
      if (event.data && event.data.startsWith(':')) {
        console.log('[SSE] Heartbeat received');
        return;
      }
      
      // Handle empty data
      if (!event.data) {
        console.log('[SSE] Empty data received, skipping');
        return;
      }

      try {
        const data: SSEEvent = JSON.parse(event.data);
        console.log('[SSE] Parsed event data:', data);

        if (data.type === 'connected') {
          console.log('[SSE] ✅✅✅ Connected event received for post:', data.postId);
          console.log('[SSE] This confirms the SSE connection is working and receiving messages!');
          setIsConnected(true);
        } else if (data.type === 'voteUpdated' && data.data) {
          console.log('[SSE] ✓ Vote update received and processing:', data.data);
          const voteUpdate = data.data as VoteUpdate;
          console.log('[SSE] Calling onVoteUpdate callback with:', voteUpdate);
          if (onVoteUpdateRef.current) {
            onVoteUpdateRef.current(voteUpdate);
            console.log('[SSE] ✓ onVoteUpdate callback executed');
          } else {
            console.warn('[SSE] ⚠ onVoteUpdate callback is not defined!');
          }
        } else if (data.type === 'commentAdded' && data.data) {
          console.log('[SSE] Comment added event received:', data.data);
          onCommentAddedRef.current?.(data.data as CommentUpdate);
        } else if (data.type === 'commentDeleted' && data.data) {
          console.log('[SSE] ✓ Comment deleted event received:', data.data);
          onCommentDeletedRef.current?.(data.data as CommentDeletedUpdate);
        } else {
          console.log('[SSE] Unknown event type:', data.type);
        }
      } catch (err) {
        console.error('[SSE] Error parsing SSE message:', err);
        console.error('[SSE] Raw message that failed:', event.data);
        const error = err instanceof Error ? err : new Error('Failed to parse SSE message');
        setError(error);
        onErrorRef.current?.(error);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] ❌ Connection error event fired!', {
        error: err,
        readyState: eventSource.readyState,
        url: eventSource.url,
        stateText: eventSource.readyState === EventSource.CONNECTING ? 'CONNECTING' : 
                   eventSource.readyState === EventSource.OPEN ? 'OPEN' : 
                   eventSource.readyState === EventSource.CLOSED ? 'CLOSED' : 'UNKNOWN'
      });
      
      // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[SSE] ❌ Connection closed - will not reconnect');
        setIsConnected(false);
        const error = new Error('SSE connection closed');
        setError(error);
        onErrorRef.current?.(error);
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('[SSE] ⏳ Reconnecting... (EventSource will retry automatically)');
        // Don't set error state during reconnection, EventSource handles it automatically
        setIsConnected(false);
      } else if (eventSource.readyState === EventSource.OPEN) {
        // Connection is open, might be a temporary error, don't treat as fatal
        console.log('[SSE] ⚠️ Connection is open but error fired - might be temporary');
      }
      
      // EventSource will automatically try to reconnect
      // Only report errors if connection is actually closed
    };

    // Cleanup on unmount
    return () => {
      console.log('[SSE] Cleanup function called for post:', postId);
      console.log('[SSE] EventSource state before cleanup:', {
        exists: !!eventSourceRef.current,
        readyState: eventSourceRef.current?.readyState,
        url: eventSourceRef.current?.url
      });
      
      if (eventSourceRef.current) {
        console.log('[SSE] Closing EventSource...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      isInitializingRef.current = false;
      setIsConnected(false);
      console.log('[SSE] Cleanup complete');
    };
  }, [postId, enabled]); // Only depend on postId and enabled, not callbacks (they're memoized in parent)

  return {
    isConnected,
    error,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    },
  };
}

