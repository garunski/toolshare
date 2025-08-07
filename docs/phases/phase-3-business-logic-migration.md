# Phase 3: Move Business Logic to API Routes

## 🎯 Objective
Move all business logic from `src/common/operations/` to be colocated with API routes, ensuring each API endpoint has its business logic directly associated with it.

---

## 🚨 Current State Analysis

**Problem:** Business logic is scattered in `src/common/operations/` instead of being colocated with API routes
```
src/common/operations/
├── toolCRUD.ts (45 lines) - Tool creation/update/delete logic
├── toolQueries.ts (38 lines) - Tool search and filtering logic
├── userCreation.ts (52 lines) - User management logic
├── roleAssignments.ts (41 lines) - Role assignment logic
├── loanOperations.ts (67 lines) - Loan processing logic
├── friendOperations.ts (34 lines) - Friend request logic
└── (60+ other operation files) - All business logic scattered
```

**Impact:**
- Business logic not colocated with API endpoints
- Difficult to understand what logic belongs to which endpoint
- No clear ownership of business operations
- Hard to maintain and test business logic
- Violates colocation principles

---

## 🚀 Step-by-Step Implementation

### Step 1: Analyze Current Operations

**Identify all operation files and their purposes:**

```bash
# List all operation files
find src/common/operations -name "*.ts" | head -20

# Example operation files to move:
# - toolCRUD.ts → API routes for tool CRUD operations
# - toolQueries.ts → API routes for tool search/list
# - userCreation.ts → Admin API routes for user management
# - roleAssignments.ts → Admin API routes for role management
# - loanOperations.ts → API routes for loan processing
# - friendOperations.ts → Social API routes for friend requests
```

### Step 2: Create API Route Structure

**Create the proper API route structure for business logic:**

```bash
# Create API route directories
mkdir -p src/app/api/\(app\)/tools/create
mkdir -p src/app/api/\(app\)/tools/list
mkdir -p src/app/api/\(app\)/tools/\[id\]/update
mkdir -p src/app/api/\(app\)/tools/\[id\]/delete

mkdir -p src/app/api/\(app\)/loans/create
mkdir -p src/app/api/\(app\)/loans/list
mkdir -p src/app/api/\(app\)/loans/\[id\]/update

mkdir -p src/app/api/\(app\)/social/friends/request
mkdir -p src/app/api/\(app\)/social/friends/list
mkdir -p src/app/api/\(app\)/social/messages/send
mkdir -p src/app/api/\(app\)/social/messages/list

mkdir -p src/app/api/admin/users/create
mkdir -p src/app/api/admin/users/list
mkdir -p src/app/api/admin/users/\[userId\]/update
mkdir -p src/app/api/admin/users/\[userId\]/delete

mkdir -p src/app/api/admin/roles/assign
mkdir -p src/app/api/admin/roles/list

mkdir -p src/app/api/\(auth\)/login
mkdir -p src/app/api/\(auth\)/register
```

### Step 3: Move Tool Operations

**Move tool-related business logic to API routes:**

```bash
# Move tool CRUD operations
mv src/common/operations/toolCRUD.ts src/app/api/\(app\)/tools/create/performTool.ts
mv src/common/operations/toolQueries.ts src/app/api/\(app\)/tools/list/getTools.ts

# Create update and delete operations
cp src/common/operations/toolCRUD.ts src/app/api/\(app\)/tools/\[id\]/update/performToolUpdate.ts
cp src/common/operations/toolCRUD.ts src/app/api/\(app\)/tools/\[id\]/delete/performToolDelete.ts
```

**Update the moved files to focus on their specific operations:**

```typescript
// src/app/api/(app)/tools/create/performTool.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function performTool(toolData: ToolCreationData) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: tool, error } = await supabase
    .from('items')
    .insert({
      ...toolData,
      owner_id: user.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return tool;
}
```

```typescript
// src/app/api/(app)/tools/list/getTools.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function getTools(filters?: ToolFilters) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  let query = supabase
    .from('items')
    .select(`
      *,
      categories(name),
      profiles!items_owner_id_fkey(name, avatar_url)
    `);
    
  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }
  
  if (filters?.availability) {
    query = query.eq('availability_status', filters.availability);
  }
  
  const { data: tools, error } = await query
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return tools;
}
```

### Step 4: Move User Management Operations

**Move user-related business logic to admin API routes:**

```bash
# Move user management operations
mv src/common/operations/userCreation.ts src/app/api/admin/users/create/performUser.ts
mv src/common/operations/userQueries.ts src/app/api/admin/users/list/getUsers.ts
mv src/common/operations/userUpdate.ts src/app/api/admin/users/\[userId\]/update/performUserUpdate.ts
mv src/common/operations/userDelete.ts src/app/api/admin/users/\[userId\]/delete/performUserDelete.ts
```

```typescript
// src/app/api/admin/users/create/performUser.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function performUser(userData: UserCreationData) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // Check admin permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
    
  if (userRole?.role !== 'admin') throw new Error('Insufficient permissions');
  
  // Create user logic here
  const { data: newUser, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single();
    
  if (error) throw error;
  return newUser;
}
```

### Step 5: Move Loan Operations

**Move loan-related business logic to API routes:**

```bash
# Move loan operations
mv src/common/operations/loanOperations.ts src/app/api/\(app\)/loans/create/performLoan.ts
mv src/common/operations/loanQueries.ts src/app/api/\(app\)/loans/list/getLoans.ts
mv src/common/operations/loanStatusUpdate.ts src/app/api/\(app\)/loans/\[id\]/update/performLoanUpdate.ts
```

```typescript
// src/app/api/(app)/loans/create/performLoan.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function performLoan(loanData: LoanCreationData) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Check if tool is available
  const { data: tool } = await supabase
    .from('items')
    .select('availability_status')
    .eq('id', loanData.tool_id)
    .single();
    
  if (tool?.availability_status !== 'available') {
    throw new Error('Tool is not available for loan');
  }
  
  // Create loan
  const { data: loan, error } = await supabase
    .from('loans')
    .insert({
      ...loanData,
      borrower_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Update tool availability
  await supabase
    .from('items')
    .update({ availability_status: 'pending' })
    .eq('id', loanData.tool_id);
    
  return loan;
}
```

### Step 6: Move Social Operations

**Move social-related business logic to API routes:**

```bash
# Move social operations
mv src/common/operations/friendOperations.ts src/app/api/\(app\)/social/friends/request/performFriendRequest.ts
mv src/common/operations/friendQueries.ts src/app/api/\(app\)/social/friends/list/getFriends.ts
mv src/common/operations/messageOperations.ts src/app/api/\(app\)/social/messages/send/performMessage.ts
mv src/common/operations/messageQueries.ts src/app/api/\(app\)/social/messages/list/getMessages.ts
```

```typescript
// src/app/api/(app)/social/friends/request/performFriendRequest.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function performFriendRequest(requestData: FriendRequestData) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Check if request already exists
  const { data: existingRequest } = await supabase
    .from('friend_requests')
    .select('id')
    .eq('requester_id', user.id)
    .eq('recipient_id', requestData.recipient_id)
    .single();
    
  if (existingRequest) {
    throw new Error('Friend request already sent');
  }
  
  // Create friend request
  const { data: friendRequest, error } = await supabase
    .from('friend_requests')
    .insert({
      requester_id: user.id,
      recipient_id: requestData.recipient_id,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return friendRequest;
}
```

### Step 7: Move Authentication Operations

**Move auth-related business logic to auth API routes:**

```bash
# Move auth operations
mv src/common/operations/loginOperations.ts src/app/api/\(auth\)/login/performLogin.ts
mv src/common/operations/registerOperations.ts src/app/api/\(auth\)/register/performRegister.ts
```

```typescript
// src/app/api/(auth)/login/performLogin.ts
import { createServerClient } from '@/common/supabase/server';
import { cookies } from 'next/headers';

export async function performLogin(credentials: LoginCredentials) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });
  
  if (error) throw error;
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
    
  return { user: data.user, profile };
}
```

### Step 8: Update Import Statements

**Update all imports to use the new locations:**

```bash
# Update imports for moved operation files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/operations/toolCRUD|@/api/app/tools/create/performTool|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/operations/toolQueries|@/api/app/tools/list/getTools|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/operations/userCreation|@/api/admin/users/create/performUser|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/operations/loanOperations|@/api/app/loans/create/performLoan|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/operations/friendOperations|@/api/app/social/friends/request/performFriendRequest|g'
```

### Step 9: Create Route Files

**Create the actual API route files that use the business logic:**

```typescript
// src/app/api/(app)/tools/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { performTool } from './performTool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await performTool(body);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

```typescript
// src/app/api/(app)/tools/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTools } from './getTools';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);
    const tools = await getTools(filters);
    
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📋 Verification Checklist

### ✅ Business Logic Colocation Verification

- [ ] All operation files moved to appropriate API routes
- [ ] Business logic colocated with API endpoints
- [ ] Clear ownership of business operations
- [ ] No business logic remaining in `src/common/operations/`
- [ ] Import statements updated to use new locations

### ✅ API Route Structure Verification

- [ ] API routes follow proper structure
- [ ] Each endpoint has its business logic
- [ ] Route files properly import business logic
- [ ] Error handling implemented in routes
- [ ] Proper HTTP status codes returned

### ✅ Functionality Verification

- [ ] All API endpoints work correctly
- [ ] Business logic preserved after moving
- [ ] No functionality broken
- [ ] Proper error handling maintained
- [ ] Authentication/authorization preserved

---

## 🎯 Success Criteria

- ✅ All business logic moved from `src/common/operations/` to API routes
- ✅ Business logic colocated with API endpoints
- ✅ Clear ownership of business operations
- ✅ No business logic remaining in common directory
- ✅ All imports updated to use new locations
- ✅ API routes properly structured and functional
- ✅ All existing functionality preserved

---

## 🚨 Common Issues and Solutions

### Issue: Circular Dependencies
**Problem:** Moving business logic creates circular import dependencies
**Solution:** 
- Analyze dependencies before moving
- Move files in dependency order
- Extract shared utilities to separate files

### Issue: Missing Imports
**Problem:** Import statements not updated after moving files
**Solution:**
- Use IDE refactoring tools to update imports
- Run TypeScript compiler to catch missing imports
- Use search and replace for common import patterns

### Issue: Function Naming
**Problem:** Business logic functions need clear, specific names
**Solution:**
- Use descriptive names like `performTool`, `getTools`
- Avoid generic names like `create`, `update`
- Make context clear from function name

---

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Server-Side Operations](https://supabase.com/docs/guides/auth/server-side)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

*Phase 3 focuses on moving all business logic from the scattered operations directory to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
