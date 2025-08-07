# Phase 4: Move Validation to Where It's Used

## 🎯 Objective
Move all validation schemas from `src/common/validators/` to be colocated with forms and APIs, ensuring validation is directly associated with where it's used.

---

## 🚨 Current State Analysis

**Problem:** Validation schemas are scattered in `src/common/validators/` instead of being colocated with forms and APIs
```
src/common/validators/
├── toolCreationValidator.ts (32 lines) - Tool creation validation
├── userCreationValidator.ts (28 lines) - User creation validation
├── loginValidator.ts (15 lines) - Login form validation
├── registerValidator.ts (24 lines) - Registration form validation
├── roleValidator.ts (18 lines) - Role assignment validation
├── loanValidator.ts (21 lines) - Loan creation validation
├── friendRequestValidator.ts (16 lines) - Friend request validation
└── (15+ other validator files) - All validation scattered
```

**Impact:**
- Validation not colocated with forms/APIs
- Difficult to understand what validation belongs to which form/API
- No clear ownership of validation logic
- Hard to maintain and update validation rules
- Violates colocation principles

---

## 🚀 Step-by-Step Implementation

### Step 1: Analyze Current Validators

**Identify all validator files and their purposes:**

```bash
# List all validator files
find src/common/validators -name "*.ts" | head -20

# Example validator files to move:
# - toolCreationValidator.ts → Tool creation form/API
# - userCreationValidator.ts → Admin user creation API
# - loginValidator.ts → Login form
# - registerValidator.ts → Registration form
# - roleValidator.ts → Admin role assignment API
# - loanValidator.ts → Loan creation form/API
# - friendRequestValidator.ts → Friend request form/API
```

### Step 2: Move Form Validation to Forms

**Move validation schemas to their respective forms:**

```bash
# Move form validation schemas
mv src/common/validators/loginValidator.ts src/app/\(auth\)/login/validation/validateLogin.ts
mv src/common/validators/registerValidator.ts src/app/\(auth\)/register/validation/validateRegister.ts
mv src/common/validators/profileSetupValidator.ts src/app/\(auth\)/profile-setup/validation/validateProfileSetup.ts

# Move tool form validation
mv src/common/validators/toolCreationValidator.ts src/app/\(app\)/tools/add/validation/validateTool.ts
mv src/common/validators/toolUpdateValidator.ts src/app/\(app\)/tools/\[id\]/validation/validateToolUpdate.ts

# Move loan form validation
mv src/common/validators/loanValidator.ts src/app/\(app\)/loans/validation/validateLoan.ts
mv src/common/validators/loanRequestValidator.ts src/app/\(app\)/tools/\[id\]/validation/validateLoanRequest.ts
```

**Update the moved validation files to be more specific:**

```typescript
// src/app/(auth)/login/validation/validateLogin.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function validateLogin(data: unknown): LoginFormData {
  return loginSchema.parse(data);
}
```

```typescript
// src/app/(app)/tools/add/validation/validateTool.ts
import { z } from 'zod';

export const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required').max(100, 'Tool name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().uuid('Invalid category'),
  availability_status: z.enum(['available', 'unavailable', 'maintenance']),
  location: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  attributes: z.record(z.any()).optional(),
});

export type ToolFormData = z.infer<typeof toolSchema>;

export function validateTool(data: unknown): ToolFormData {
  return toolSchema.parse(data);
}
```

### Step 3: Move API Validation to API Routes

**Move validation schemas to their respective API routes:**

```bash
# Move admin API validation
mv src/common/validators/userCreationValidator.ts src/app/api/admin/users/create/validateUser.ts
mv src/common/validators/userUpdateValidator.ts src/app/api/admin/users/\[userId\]/update/validateUser.ts
mv src/common/validators/roleValidator.ts src/app/api/admin/roles/assign/validateRoleAssignment.ts

# Move app API validation
mv src/common/validators/loanValidator.ts src/app/api/\(app\)/loans/create/validateLoan.ts
mv src/common/validators/friendRequestValidator.ts src/app/api/\(app\)/social/friends/request/validateFriendRequest.ts
mv src/common/validators/messageValidator.ts src/app/api/\(app\)/social/messages/send/validateMessage.ts

# Move auth API validation
mv src/common/validators/loginValidator.ts src/app/api/\(auth\)/login/validateLogin.ts
mv src/common/validators/registerValidator.ts src/app/api/\(auth\)/register/validateRegister.ts
```

**Update the moved validation files for API use:**

```typescript
// src/app/api/admin/users/create/validateUser.ts
import { z } from 'zod';

export const userCreationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['user', 'admin']).default('user'),
});

export type UserCreationData = z.infer<typeof userCreationSchema>;

export function validateUser(data: unknown): UserCreationData {
  return userCreationSchema.parse(data);
}
```

```typescript
// src/app/api/(app)/loans/create/validateLoan.ts
import { z } from 'zod';

export const loanCreationSchema = z.object({
  tool_id: z.string().uuid('Invalid tool ID'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  notes: z.string().optional(),
});

export type LoanCreationData = z.infer<typeof loanCreationSchema>;

export function validateLoan(data: unknown): LoanCreationData {
  return loanCreationSchema.parse(data);
}
```

### Step 4: Update Form Components to Use Local Validation

**Update form components to import validation from local files:**

```typescript
// src/app/(auth)/login/components/LoginForm.tsx
import { validateLogin, type LoginFormData } from '../validation/validateLogin';

export function LoginForm() {
  const handleSubmit = async (data: LoginFormData) => {
    try {
      const validatedData = validateLogin(data);
      // Submit form logic
    } catch (error) {
      // Handle validation error
    }
  };
  
  // Form JSX
}
```

```typescript
// src/app/(app)/tools/add/components/AddToolForm.tsx
import { validateTool, type ToolFormData } from '../validation/validateTool';

export function AddToolForm() {
  const handleSubmit = async (data: ToolFormData) => {
    try {
      const validatedData = validateTool(data);
      // Submit form logic
    } catch (error) {
      // Handle validation error
    }
  };
  
  // Form JSX
}
```

### Step 5: Update API Routes to Use Local Validation

**Update API routes to import validation from local files:**

```typescript
// src/app/api/(app)/tools/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateTool } from './validateTool';
import { performTool } from './performTool';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateTool(body);
    const result = await performTool(validatedData);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/admin/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from './validateUser';
import { performUser } from './performUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateUser(body);
    const result = await performUser(validatedData);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Step 6: Update Import Statements

**Update all imports to use the new validation locations:**

```bash
# Update imports for moved validation files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/validators/loginValidator|@/app/auth/login/validation/validateLogin|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/validators/registerValidator|@/app/auth/register/validation/validateRegister|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/validators/toolCreationValidator|@/app/app/tools/add/validation/validateTool|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/validators/userCreationValidator|@/api/admin/users/create/validateUser|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/validators/loanValidator|@/api/app/loans/create/validateLoan|g'
```

### Step 7: Create Validation Index Files

**Create index files for better organization:**

```typescript
// src/app/(auth)/login/validation/index.ts
export { validateLogin, loginSchema, type LoginFormData } from './validateLogin';
```

```typescript
// src/app/(app)/tools/add/validation/index.ts
export { validateTool, toolSchema, type ToolFormData } from './validateTool';
```

```typescript
// src/app/api/admin/users/create/validation/index.ts
export { validateUser, userCreationSchema, type UserCreationData } from './validateUser';
```

### Step 8: Remove Empty Validators Directory

**Clean up after moving all validation files:**

```bash
# Remove empty validators directory
rmdir src/common/validators

# Remove any other empty directories created during the process
find src -type d -empty -delete
```

---

## 📋 Verification Checklist

### ✅ Validation Colocation Verification

- [ ] All validation files moved to their respective forms/APIs
- [ ] Validation colocated with where it's used
- [ ] Clear ownership of validation logic
- [ ] No validation remaining in `src/common/validators/`
- [ ] Import statements updated to use new locations

### ✅ Form Validation Verification

- [ ] Form components import validation from local files
- [ ] Validation schemas are specific to their forms
- [ ] Form validation working correctly
- [ ] Error handling implemented in forms
- [ ] TypeScript types properly exported

### ✅ API Validation Verification

- [ ] API routes import validation from local files
- [ ] Validation schemas are specific to their APIs
- [ ] API validation working correctly
- [ ] Proper error responses for validation failures
- [ ] HTTP status codes properly set

---

## 🎯 Success Criteria

- ✅ All validation moved from `src/common/validators/` to forms/APIs
- ✅ Validation colocated with where it's used
- ✅ Clear ownership of validation logic
- ✅ No validation remaining in common directory
- ✅ All imports updated to use new locations
- ✅ Form and API validation working correctly
- ✅ All existing functionality preserved

---

## 🚨 Common Issues and Solutions

### Issue: Validation Reuse
**Problem:** Same validation used in multiple places
**Solution:**
- Create shared validation utilities in common/supabase
- Use composition to build complex validations
- Keep form-specific validation local

### Issue: Import Paths
**Problem:** Import statements not updated after moving validation
**Solution:**
- Use IDE refactoring tools to update imports
- Run TypeScript compiler to catch missing imports
- Use search and replace for common import patterns

### Issue: Validation Consistency
**Problem:** Different validation rules in different places
**Solution:**
- Use shared base schemas for common fields
- Document validation rules clearly
- Test validation consistency across forms/APIs

---

## 📚 Additional Resources

- [Zod Documentation](https://zod.dev/)
- [Next.js Form Handling](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)
- [TypeScript Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)

---

*Phase 4 focuses on moving all validation schemas from the scattered validators directory to be colocated with their respective forms and APIs, ensuring clear ownership and maintainability.*
