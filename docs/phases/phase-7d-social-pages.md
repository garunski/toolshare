# Phase 7d: Social Pages Data Extraction

## 🎯 Objective
Convert social and messaging pages from client-side data fetching to server components, handling real-time features and user interactions properly.

---

## 📋 Target Files (3 pages)

### 1. `src/app/(app)/social/social/page.tsx` - Social Feed
**Current State:** Social feed with client-side data fetching
**Complexity:** ⭐⭐⭐ High (user-specific data, social features)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current social feed data fetching
- [ ] Create `src/app/(app)/social/social/getSocialFeedData.ts` server function
- [ ] Convert page to server component
- [ ] Create `components/SocialFeed` UI component
- [ ] Create `components/FriendsList` UI component
- [ ] Create `components/SocialActions` client component (for interactions)
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update friend request functionality
- [ ] Run `task validate` and fix any issues

### 2. `src/app/(app)/social/social/messages/[userId]/page.tsx` - Direct Messages
**Current State:** Dynamic route with real-time messaging
**Complexity:** ⭐⭐⭐⭐ Very High (dynamic route, real-time data, user-specific)
**Estimated Time:** 2 hours

**Sub-tasks:**
- [ ] Analyze current messaging data fetching and real-time logic
- [ ] Create `src/app/(app)/social/social/messages/[userId]/getConversationData.ts` server function
- [ ] Handle user not found with Next.js notFound()
- [ ] Convert page wrapper to server component
- [ ] Create `components/ConversationHeader` UI component
- [ ] Create `components/MessagesList` UI component
- [ ] Create `components/MessageInput` client component (for real-time)
- [ ] Keep real-time messaging as client component
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update message sending functionality
- [ ] Run `task validate` and fix any issues

### 3. `src/app/(app)/social/social/profile/[userId]/page.tsx` - User Profile
**Current State:** Dynamic route with user profile and social data
**Complexity:** ⭐⭐⭐ High (dynamic route, user-specific data)
**Estimated Time:** 1.5 hours

**Sub-tasks:**
- [ ] Analyze current profile data fetching
- [ ] Create `src/app/(app)/social/social/profile/[userId]/getProfileData.ts` server function
- [ ] Handle user not found with Next.js notFound()
- [ ] Convert page to server component
- [ ] Create `components/UserProfile` UI component
- [ ] Create `components/ProfileStats` UI component
- [ ] Create `components/ProfileActions` client component (for interactions)
- [ ] Add `loading.tsx` and `error.tsx`
- [ ] Update profile interaction functionality
- [ ] Run `task validate` and fix any issues

---

## 🚀 Implementation Details

### Server Function Examples

```typescript
// src/app/(app)/social/social/getSocialFeedData.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getSocialFeedData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Get user's friends
  const { data: friends, error: friendsError } = await supabase
    .from('friendships')
    .select(`
      friend_id,
      profiles!friendships_friend_id_fkey(
        id,
        name,
        avatar_url,
        bio
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted');
    
  if (friendsError) throw friendsError;
  
  // Get friend requests
  const { data: friendRequests, error: requestsError } = await supabase
    .from('friend_requests')
    .select(`
      *,
      profiles!friend_requests_sender_id_fkey(
        name,
        avatar_url
      )
    `)
    .eq('receiver_id', user.id)
    .eq('status', 'pending');
    
  if (requestsError) throw requestsError;
  
  // Get recent activity from friends
  const friendIds = friends?.map(f => f.friend_id) || [];
  const { data: recentActivity, error: activityError } = await supabase
    .from('items')
    .select(`
      id,
      name,
      image_url,
      created_at,
      profiles!items_owner_id_fkey(
        name,
        avatar_url
      )
    `)
    .in('owner_id', friendIds)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (activityError) throw activityError;
  
  return {
    friends: friends || [],
    friendRequests: friendRequests || [],
    recentActivity: recentActivity || []
  };
}
```

```typescript
// src/app/(app)/social/social/messages/[userId]/getConversationData.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function getConversationData(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Get the other user's profile
  const { data: otherUser, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (userError || !otherUser) {
    notFound();
  }
  
  // Check if users are friends or can message
  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
    .eq('status', 'accepted')
    .single();
    
  if (!friendship) {
    throw new Error('Cannot message this user');
  }
  
  // Get conversation messages (initial load)
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      *,
      profiles!messages_sender_id_fkey(
        name,
        avatar_url
      )
    `)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
    .limit(50);
    
  if (messagesError) throw messagesError;
  
  // Mark messages as read
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', user.id)
    .eq('sender_id', userId)
    .is('read_at', null);
  
  return {
    otherUser,
    messages: messages || [],
    currentUserId: user.id
  };
}
```

```typescript
// src/app/(app)/social/social/profile/[userId]/getProfileData.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export async function getProfileData(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (profileError || !profile) {
    notFound();
  }
  
  // Get user's tools
  const { data: userTools, error: toolsError } = await supabase
    .from('items')
    .select(`
      id,
      name,
      image_url,
      availability_status,
      categories(name)
    `)
    .eq('owner_id', userId)
    .eq('visibility', 'public')
    .limit(6);
    
  if (toolsError) throw toolsError;
  
  // Get friendship status
  const { data: friendship } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
    .single();
  
  // Get friend request status
  const { data: friendRequest } = await supabase
    .from('friend_requests')
    .select('status, sender_id')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
    .eq('status', 'pending')
    .single();
  
  // Get profile stats
  const [toolsCount, friendsCount, loansCount] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact' }).eq('owner_id', userId),
    supabase.from('friendships').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'accepted'),
    supabase.from('loans').select('id', { count: 'exact' }).eq('borrower_id', userId).eq('status', 'completed')
  ]);
  
  return {
    profile,
    userTools: userTools || [],
    friendshipStatus: friendship?.status || null,
    friendRequest: friendRequest || null,
    isOwnProfile: user.id === userId,
    stats: {
      toolsCount: toolsCount.count || 0,
      friendsCount: friendsCount.count || 0,
      loansCount: loansCount.count || 0
    }
  };
}
```

### Page Conversion Examples

```typescript
// After: src/app/(app)/social/social/page.tsx
import { getSocialFeedData } from './getSocialFeedData';
import { SocialFeed } from './components/SocialFeed';
import { FriendsList } from './components/FriendsList';
import { SocialActions } from './components/SocialActions';

export default async function SocialPage() {
  const { friends, friendRequests, recentActivity } = await getSocialFeedData();
  
  return (
    <div className="social-layout">
      <div className="social-sidebar">
        <FriendsList friends={friends} />
        {friendRequests.length > 0 && (
          <SocialActions friendRequests={friendRequests} />
        )}
      </div>
      
      <div className="social-main">
        <h1>Social Feed</h1>
        <SocialFeed activity={recentActivity} />
      </div>
    </div>
  );
}
```

```typescript
// After: src/app/(app)/social/social/messages/[userId]/page.tsx
import { getConversationData } from './getConversationData';
import { ConversationHeader } from './components/ConversationHeader';
import { MessagesList } from './components/MessagesList';
import { MessageInput } from './components/MessageInput';

interface MessagesPageProps {
  params: { userId: string };
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { otherUser, messages, currentUserId } = await getConversationData(params.userId);
  
  return (
    <div className="messages-layout">
      <ConversationHeader user={otherUser} />
      
      <div className="messages-container">
        <MessagesList 
          messages={messages} 
          currentUserId={currentUserId}
          otherUserId={params.userId}
        />
      </div>
      
      <MessageInput 
        receiverId={params.userId}
        currentUserId={currentUserId}
      />
    </div>
  );
}
```

### Client Component for Real-time Features

```typescript
// src/app/(app)/social/social/messages/[userId]/components/MessageInput/index.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MessageInputProps {
  receiverId: string;
  currentUserId: string;
}

export function MessageInput({ receiverId, currentUserId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/social/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          message: message.trim()
        })
      });
      
      if (response.ok) {
        setMessage('');
        router.refresh(); // Refresh to show new message
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <form onSubmit={handleSendMessage} className="message-input-form">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={sending}
      />
      <button type="submit" disabled={!message.trim() || sending}>
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

---

## ✅ Verification Checklist

### File Creation Verification
- [ ] `getSocialFeedData.ts` server function created
- [ ] `getConversationData.ts` server function created
- [ ] `getProfileData.ts` server function created
- [ ] All 3 pages converted to server components
- [ ] All 6 error.tsx and loading.tsx files created
- [ ] UI components extracted from pages
- [ ] Client components created for interactive features

### Social Features Verification
- [ ] Social feed loads correctly with friends and activity
- [ ] Direct messaging works with proper conversation loading
- [ ] User profiles load with stats and tools
- [ ] Friend request functionality preserved
- [ ] Real-time messaging features work
- [ ] Profile interactions work correctly

### Security Verification
- [ ] User authentication checks in all server functions
- [ ] Privacy controls for user profiles respected
- [ ] Messaging permissions properly validated
- [ ] Friend relationship checks implemented
- [ ] No unauthorized data access possible

### Functionality Verification
- [ ] Dynamic routes handle not found correctly
- [ ] Real-time features preserved as client components
- [ ] Social interactions work correctly
- [ ] Message sending and receiving works
- [ ] Profile viewing and interactions work
- [ ] `task validate` passes without errors

---

## 🎯 Success Criteria

- ✅ 3 social pages converted to server components
- ✅ 3 server data fetching functions created
- ✅ Real-time messaging features preserved
- ✅ Social interactions properly implemented
- ✅ Privacy and security controls maintained
- ✅ Dynamic routes properly handle not found
- ✅ All social functionality preserved
- ✅ Client components used appropriately for interactivity
- ✅ `task validate` passes without errors

---

*Phase 7d handles the complex social features while preserving real-time functionality and ensuring proper privacy controls.*
