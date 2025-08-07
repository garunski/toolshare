# Phase 9: Restructure API Routes by Verb/Intent

## 🎯 Objective
Reorganize API routes to follow explicit verb/intent naming with proper file size limits, ensuring each endpoint has a single responsibility and clear purpose.

## 📊 Current State Analysis

### Problem
- **Mixed responsibilities** in single API route files (e.g., `tools/route.ts` handles create, read, update, delete)
- **Large file sizes** exceeding 100-line limit for API routes
- **Unclear intent** from route naming (not following verb/intent pattern)
- **Inconsistent structure** across different API sections
- **No clear separation** between different operations within the same resource

### Impact
- **Difficult maintenance** due to large, complex route files
- **Poor code organization** making it hard to find specific functionality
- **Violation of single responsibility principle**
- **Inconsistent API patterns** across the application
- **Harder testing** due to mixed concerns in single files

## 🚀 Step-by-Step Implementation

### Step 1: Analyze Current API Routes
Identify all current API routes and their responsibilities:

```typescript
// Current problematic structure
src/app/api/
├── tools/route.ts (56 lines) - Handles GET, POST, PUT, DELETE
├── admin/users/route.ts (106 lines) - Handles user CRUD operations
├── admin/users/[userId]/roles/route.ts (148 lines) - Handles role assignments
└── loans/route.ts (45 lines) - Handles loan operations
```

### Step 2: Create Verb/Intent Structure
Reorganize API routes by verb/intent:

```typescript
// Target structure for tools
src/app/api/(app)/tools/
├── create/
│   ├── route.ts (max 100 lines)
│   ├── validateTool.ts
│   └── performTool.ts
├── list/
│   ├── route.ts (max 100 lines)
│   └── getTools.ts
├── [id]/
│   ├── update/
│   │   ├── route.ts (max 100 lines)
│   │   ├── validateTool.ts
│   │   └── performTool.ts
│   ├── delete/
│   │   ├── route.ts (max 100 lines)
│   │   └── performTool.ts
│   └── get/
│       ├── route.ts (max 100 lines)
│       └── getTool.ts
```

### Step 3: Restructure Tools API Routes
Break down the existing tools route:

```typescript
// src/app/api/(app)/tools/create/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { validateTool } from './validateTool';
import { performTool } from './performTool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateTool(body);
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const result = await performTool(validatedData, userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/(app)/tools/list/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getTools } from './getTools';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const filters = {
      category: searchParams.get('category'),
      search: searchParams.get('search'),
      owner: searchParams.get('owner'),
    };
    
    const tools = await getTools(userId, filters);
    return Response.json(tools);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/(app)/tools/[id]/update/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { validateTool } from './validateTool';
import { performTool } from './performTool';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = validateTool(body);
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const result = await performTool(validatedData, userId, params.id);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/(app)/tools/[id]/delete/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { performTool } from './performTool';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await performTool({ action: 'delete' }, userId, params.id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 4: Restructure Admin Users API Routes
Break down the admin users routes:

```typescript
// src/app/api/admin/users/create/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { validateUser } from './validateUser';
import { performUser } from './performUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateUser(body);
    
    const adminId = request.headers.get('x-user-id');
    if (!adminId) {
      throw new Error('Admin not authenticated');
    }
    
    const result = await performUser(validatedData, adminId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/admin/users/list/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getUsers } from './getUsers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = request.headers.get('x-user-id');
    
    if (!adminId) {
      throw new Error('Admin not authenticated');
    }
    
    const filters = {
      role: searchParams.get('role'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
    };
    
    const users = await getUsers(adminId, filters);
    return Response.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/admin/users/[userId]/update/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { validateUser } from './validateUser';
import { performUser } from './performUser';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = validateUser(body);
    
    const adminId = request.headers.get('x-user-id');
    if (!adminId) {
      throw new Error('Admin not authenticated');
    }
    
    const result = await performUser(validatedData, adminId, params.userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 5: Restructure Role Assignment Routes
Break down the role assignment routes:

```typescript
// src/app/api/admin/users/[userId]/roles/assign/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { validateRoleAssignment } from './validateRoleAssignment';
import { performRoleAssignment } from './performRoleAssignment';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = validateRoleAssignment(body);
    
    const adminId = request.headers.get('x-user-id');
    if (!adminId) {
      throw new Error('Admin not authenticated');
    }
    
    const result = await performRoleAssignment(validatedData, adminId, params.userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/admin/users/[userId]/roles/list/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getRoleAssignments } from './getRoleAssignments';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const adminId = request.headers.get('x-user-id');
    if (!adminId) {
      throw new Error('Admin not authenticated');
    }
    
    const roles = await getRoleAssignments(adminId, params.userId);
    return Response.json(roles);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 6: Restructure Loans API Routes
Break down the loans routes:

```typescript
// src/app/api/(app)/loans/create/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { validateLoan } from './validateLoan';
import { performLoan } from './performLoan';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateLoan(body);
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const result = await performLoan(validatedData, userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

```typescript
// src/app/api/(app)/loans/list/route.ts
import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getLoans } from './getLoans';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const filters = {
      status: searchParams.get('status'),
      type: searchParams.get('type'),
    };
    
    const loans = await getLoans(userId, filters);
    return Response.json(loans);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 7: Update Import Statements
Update all files that import from the old API routes:

```typescript
// Before: Importing from old structure
import { createTool } from '@/app/api/tools/route';

// After: Importing from new structure
import { performTool } from '@/app/api/(app)/tools/create/performTool';
```

### Step 8: Create Index Files for Clean Imports
Create index files to maintain clean import paths:

```typescript
// src/app/api/(app)/tools/index.ts
export { performTool } from './create/performTool';
export { getTools } from './list/getTools';
export { getTool } from './[id]/get/getTool';
```

```typescript
// src/app/api/admin/users/index.ts
export { performUser } from './create/performUser';
export { getUsers } from './list/getUsers';
export { performRoleAssignment } from './[userId]/roles/assign/performRoleAssignment';
```

### Step 9: Update Frontend API Calls
Update all frontend components to use the new API structure:

```typescript
// Before: Using old API structure
const response = await fetch('/api/tools', {
  method: 'POST',
  body: JSON.stringify(toolData),
});

// After: Using new API structure
const response = await fetch('/api/tools/create', {
  method: 'POST',
  body: JSON.stringify(toolData),
});
```

## ✅ Verification Checklist

- [ ] All API routes restructured by verb/intent
- [ ] Each route file under 100 lines
- [ ] Clear separation of concerns in each route
- [ ] Proper validation and business logic separation
- [ ] All import statements updated
- [ ] Frontend API calls updated
- [ ] Index files created for clean imports
- [ ] Error handling consistent across all routes
- [ ] Authentication and authorization working
- [ ] File size limits enforced
- [ ] Run `task validate` to ensure API routes work correctly

## 🎯 Success Criteria

- ✅ All API routes follow verb/intent naming pattern
- ✅ Each route file is under 100 lines
- ✅ Clear separation of concerns in each route
- ✅ Consistent structure across all API sections
- ✅ Proper validation and business logic organization
- ✅ Clean import paths maintained
- ✅ Frontend integration working correctly
- ✅ Run `task validate` to ensure no breaking changes

## ⚠️ Common Issues and Solutions

### Issue: Route files still too large
**Solution:** Further break down into smaller, more focused functions or extract common logic.

### Issue: Import paths broken after restructuring
**Solution:** Use index files to maintain clean import paths and update all references.

### Issue: Frontend API calls failing
**Solution:** Update all fetch calls to use the new route structure and test thoroughly.

### Issue: Inconsistent error handling
**Solution:** Ensure all routes use the centralized `handleApiError` function.

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [REST API Design Best Practices](https://restfulapi.net/)
- [API Naming Conventions](https://github.com/microsoft/api-guidelines)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
