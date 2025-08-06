# Real-Time Updates System

## Supabase Real-Time Subscriptions and Live Updates

### 1. Real-Time Connection Manager
- [ ] Create: `src/common/operations/realtimeConnectionManager.ts` (under 150 lines)

```typescript
// src/common/operations/realtimeConnectionManager.ts
import { createClient } from '@/common/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
}

export class RealtimeConnectionManager {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static subscriptions: Map<string, SubscriptionConfig[]> = new Map();

  /**
   * Subscribe to real-time table changes
   */
  static subscribe(channelName: string, config: SubscriptionConfig): () => void {
    let channel = this.channels.get(channelName);
    
    if (!channel) {
      const supabase = createClient();
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
      this.subscriptions.set(channelName, []);
    }

    // Add subscription config
    const configs = this.subscriptions.get(channelName)!;
    configs.push(config);

    // Set up the subscription
    const subscription = channel.on(
      'postgres_changes',
      {
        event: config.event,
        schema: 'public',
        table: config.table,
        filter: config.filter
      },
      config.callback
    );

    // Subscribe to channel if this is the first subscription
    if (configs.length === 1) {
      channel.subscribe();
    }

    // Return unsubscribe function
    return () => this.unsubscribe(channelName, config);
  }

  /**
   * Unsubscribe from specific table events
   */
  static unsubscribe(channelName: string, config: SubscriptionConfig): void {
    const configs = this.subscriptions.get(channelName);
    if (!configs) return;

    const index = configs.indexOf(config);
    if (index > -1) {
      configs.splice(index, 1);
    }

    // If no more subscriptions, close the channel
    if (configs.length === 0) {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      }
    }
  }

  /**
   * Subscribe to admin dashboard updates
   */
  static subscribeToAdminUpdates(callback: (data: any) => void): () => void {
    const unsubscribeItems = this.subscribe('admin-items', {
      table: 'items',
      event: '*',
      callback: (payload) => callback({ type: 'items', payload })
    });

    const unsubscribeUsers = this.subscribe('admin-users', {
      table: 'profiles',
      event: '*',
      callback: (payload) => callback({ type: 'users', payload })
    });

    const unsubscribeCategories = this.subscribe('admin-categories', {
      table: 'external_product_taxonomy',
      event: '*',
      callback: (payload) => callback({ type: 'categories', payload })
    });

    return () => {
      unsubscribeItems();
      unsubscribeUsers();
      unsubscribeCategories();
    };
  }

  /**
   * Subscribe to user-specific updates
   */
  static subscribeToUserUpdates(userId: string, callback: (data: any) => void): () => void {
    const unsubscribeItems = this.subscribe(`user-items-${userId}`, {
      table: 'items',
      event: '*',
      filter: `owner_id=eq.${userId}`,
      callback: (payload) => callback({ type: 'my-items', payload })
    });

    const unsubscribeRequests = this.subscribe(`user-requests-${userId}`, {
      table: 'loan_requests',
      event: '*',
      filter: `borrower_id=eq.${userId}`,
      callback: (payload) => callback({ type: 'loan-requests', payload })
    });

    const unsubscribeMessages = this.subscribe(`user-messages-${userId}`, {
      table: 'messages',
      event: '*',
      filter: `recipient_id=eq.${userId}`,
      callback: (payload) => callback({ type: 'messages', payload })
    });

    return () => {
      unsubscribeItems();
      unsubscribeRequests();
      unsubscribeMessages();
    };
  }

  /**
   * Broadcast real-time event
   */
  static broadcast(channelName: string, event: string, payload: any): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }

  /**
   * Close all connections
   */
  static closeAllConnections(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
    this.subscriptions.clear();
  }
}
```

### 2. Real-Time Admin Dashboard Hook
- [ ] Create: `src/common/hooks/useRealtimeAdminData.ts` (under 150 lines)

```typescript
// src/common/hooks/useRealtimeAdminData.ts
import { useState, useEffect, useCallback } from 'react';
import { RealtimeConnectionManager } from '@/common/operations/realtimeConnectionManager';
import { createClient } from '@/common/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalCategories: number;
  activeLoans: number;
  recentActivity: any[];
}

export function useRealtimeAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalItems: 0,
    totalCategories: 0,
    activeLoans: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const supabase = createClient();
      const [users, items, categories, loans, activity] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('items').select('id', { count: 'exact' }),
        supabase.from('external_product_taxonomy').select('external_id', { count: 'exact' }),
        supabase.from('loan_requests').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalItems: items.count || 0,
        totalCategories: categories.count || 0,
        activeLoans: loans.count || 0,
        recentActivity: activity.data || []
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((data: any) => {
    setLastUpdate(new Date());
    
    switch (data.type) {
      case 'users':
        if (data.payload.eventType === 'INSERT') {
          setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        } else if (data.payload.eventType === 'DELETE') {
          setStats(prev => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
        }
        break;
        
      case 'items':
        if (data.payload.eventType === 'INSERT') {
          setStats(prev => ({ ...prev, totalItems: prev.totalItems + 1 }));
        } else if (data.payload.eventType === 'DELETE') {
          setStats(prev => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
        }
        break;
        
      case 'categories':
        if (data.payload.eventType === 'INSERT') {
          setStats(prev => ({ ...prev, totalCategories: prev.totalCategories + 1 }));
        } else if (data.payload.eventType === 'DELETE') {
          setStats(prev => ({ ...prev, totalCategories: Math.max(0, prev.totalCategories - 1) }));
        }
        break;
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    
    // Subscribe to real-time updates
    const unsubscribe = RealtimeConnectionManager.subscribeToAdminUpdates(handleRealtimeUpdate);
    
    return () => {
      unsubscribe();
    };
  }, [loadInitialData, handleRealtimeUpdate]);

  return {
    stats,
    loading,
    lastUpdate,
    refresh: loadInitialData
  };
}
```

### 3. Live Activity Feed Component
- [ ] Create: `src/app/admin/components/LiveActivityFeed.tsx` (under 150 lines)

```tsx
// src/app/admin/components/LiveActivityFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/primitives/card';
import { Heading } from '@/primitives/heading';
import { Badge } from '@/primitives/badge';
import { Avatar } from '@/primitives/avatar';
import { RealtimeConnectionManager } from '@/common/operations/realtimeConnectionManager';
import { 
  UserPlusIcon, 
  PlusIcon, 
  ArrowRightIcon, 
  ChatBubbleLeftIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'user_joined' | 'item_added' | 'loan_requested' | 'message_sent';
  user_name: string;
  user_avatar?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Load initial activities
    const loadActivities = async () => {
      // Implementation would load from activity_log table
      setActivities([]);
    };
    
    loadActivities();

    // Subscribe to real-time activity updates
    const unsubscribe = RealtimeConnectionManager.subscribe('live-activity', {
      table: 'activity_log',
      event: 'INSERT',
      callback: (payload) => {
        const newActivity: ActivityItem = {
          id: payload.new.id,
          type: payload.new.type,
          user_name: payload.new.user_name,
          user_avatar: payload.new.user_avatar,
          description: payload.new.description,
          timestamp: payload.new.created_at,
          metadata: payload.new.metadata
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
        setIsLive(true);
        
        // Reset live indicator after 3 seconds
        setTimeout(() => setIsLive(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined': return <UserPlusIcon className="h-4 w-4" />;
      case 'item_added': return <PlusIcon className="h-4 w-4" />;
      case 'loan_requested': return <ArrowRightIcon className="h-4 w-4" />;
      case 'message_sent': return <ChatBubbleLeftIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_joined': return 'text-green-600 bg-green-100';
      case 'item_added': return 'text-blue-600 bg-blue-100';
      case 'loan_requested': return 'text-purple-600 bg-purple-100';
      case 'message_sent': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level={3}>Live Activity</Heading>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {isLive ? 'Live' : 'Connected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here in real-time</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <Avatar
                src={activity.user_avatar}
                alt={activity.user_name}
                size="sm"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {activity.user_name}
                  </span>
                  <Badge className={getActivityColor(activity.type)} size="sm">
                    {getActivityIcon(activity.type)}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {activity.description}
                </p>
                
                <p className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View all activity
          </button>
        </div>
      )}
    </Card>
  );
}
```

### 4. Real-Time Notifications System
- [ ] Create: `src/common/operations/realtimeNotifications.ts` (under 150 lines)

```typescript
// src/common/operations/realtimeNotifications.ts
import { RealtimeConnectionManager } from './realtimeConnectionManager';
import { createClient } from '@/common/supabase/client';

interface NotificationPayload {
  id: string;
  type: 'loan_request' | 'loan_approved' | 'loan_returned' | 'message_received' | 'item_requested';
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export class RealtimeNotifications {
  private static listeners: Map<string, (notification: NotificationPayload) => void> = new Map();

  /**
   * Subscribe to user notifications
   */
  static subscribeToNotifications(userId: string, onNotification: (notification: NotificationPayload) => void): () => void {
    this.listeners.set(userId, onNotification);

    const unsubscribe = RealtimeConnectionManager.subscribe(`notifications-${userId}`, {
      table: 'notifications',
      event: 'INSERT',
      filter: `user_id=eq.${userId}`,
      callback: (payload) => {
        const notification: NotificationPayload = {
          id: payload.new.id,
          type: payload.new.type,
          title: payload.new.title,
          message: payload.new.message,
          userId: payload.new.user_id,
          metadata: payload.new.metadata,
          read: payload.new.read,
          createdAt: payload.new.created_at
        };
        
        onNotification(notification);
        
        // Show browser notification if permission granted
        this.showBrowserNotification(notification);
      }
    });

    return () => {
      this.listeners.delete(userId);
      unsubscribe();
    };
  }

  /**
   * Send notification to user
   */
  static async sendNotification(notification: Omit<NotificationPayload, 'id' | 'read' | 'createdAt'>): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        user_id: notification.userId,
        metadata: notification.metadata,
        read: false
      });

    if (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
  }

  /**
   * Show browser notification
   */
  private static showBrowserNotification(notification: NotificationPayload): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}
```

### 5. Implementation Checklist
- [ ] Real-time connection manager with subscription handling
- [ ] Admin dashboard real-time updates hook
- [ ] Live activity feed with instant updates
- [ ] Real-time notifications system
- [ ] Browser notification integration
- [ ] Connection state management
- [ ] Error handling and reconnection logic
- [ ] Performance optimization for multiple subscriptions
- [ ] Memory leak prevention
- [ ] Graceful degradation when offline
- [ ] Real-time collaboration indicators
- [ ] Push notification support
- [ ] WebSocket connection monitoring
- [ ] Rate limiting for real-time events
- [ ] Real-time data synchronization 