# Phase 5: Move Form Components to Their Pages

## 🎯 Objective
Move all form components from `src/common/forms/` to be colocated with their respective pages, ensuring forms are directly associated with where they're used.

---

## 🚨 Current State Analysis

**Problem:** Form components are scattered in `src/common/forms/` instead of being colocated with their pages
```
src/common/forms/
├── AddToolForm.tsx (156 lines) - Tool creation form
├── RegisterForm.tsx (89 lines) - User registration form
├── LoginForm.tsx (67 lines) - User login form
├── ProfileSetupForm.tsx (78 lines) - Profile setup form
├── FormBuilder.tsx (234 lines) - Over-engineered generic form builder
├── MultiStepFormBuilder.tsx (189 lines) - Over-engineered multi-step builder
├── DynamicFormBuilder.tsx (312 lines) - Over-engineered dynamic builder
├── DynamicValidationEngine.ts (145 lines) - Over-engineered validation
└── (15+ other form files) - All forms scattered
```

**Impact:**
- Forms not colocated with their pages
- Difficult to understand what form belongs to which page
- No clear ownership of form logic
- Over-engineered generic form builders
- Hard to maintain and update forms
- Violates colocation principles

---

## 🚀 Step-by-Step Implementation

### Step 1: Analyze Current Forms

**Identify all form files and their purposes:**

```bash
# List all form files
find src/common/forms -name "*.tsx" | head -20

# Example form files to move:
# - AddToolForm.tsx → Tool creation page
# - RegisterForm.tsx → Registration page
# - LoginForm.tsx → Login page
# - ProfileSetupForm.tsx → Profile setup page
# - FormBuilder.tsx → DELETE (over-engineered)
# - MultiStepFormBuilder.tsx → DELETE (over-engineered)
# - DynamicFormBuilder.tsx → DELETE (over-engineered)
```

### Step 2: Delete Over-Engineered Form Builders

**Remove the over-engineered generic form builders:**

```bash
# Delete over-engineered form builders
rm -rf src/common/forms/FormBuilder.tsx
rm -rf src/common/forms/MultiStepFormBuilder.tsx
rm -rf src/common/forms/DynamicFormBuilder.tsx
rm -rf src/common/forms/DynamicValidationEngine.ts
rm -rf src/common/forms/FormStateManager.ts
rm -rf src/common/forms/FormErrorProcessor.ts
rm -rf src/common/forms/FormProgressIndicator.tsx
rm -rf src/common/forms/SmartDefaultsProvider.tsx
rm -rf src/common/forms/useAutoSave.ts
rm -rf src/common/forms/ValidationMessage.tsx
```

**Note:** These generic form builders are over-engineered and violate the principle of colocation. Each form should be specific to its use case.

### Step 3: Move Authentication Forms

**Move auth-related forms to their respective pages:**

```bash
# Move authentication forms
mv src/common/forms/LoginForm.tsx src/app/\(auth\)/login/components/LoginForm/index.tsx
mv src/common/forms/RegisterForm.tsx src/app/\(auth\)/register/components/RegisterForm/index.tsx
mv src/common/forms/ProfileSetupForm.tsx src/app/\(auth\)/profile-setup/components/ProfileSetupForm/index.tsx
```

**Update the moved form components to be more specific:**

```typescript
// src/app/(auth)/login/components/LoginForm/index.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { validateLogin } from '../../validation/validateLogin';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = validateLogin(formData);
      
      const response = await fetch('/api/(auth)/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      {errors.general && (
        <div className="text-red-600 text-sm">{errors.general}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

### Step 4: Move Tool Forms

**Move tool-related forms to their respective pages:**

```bash
# Move tool forms
mv src/common/forms/AddToolForm.tsx src/app/\(app\)/tools/add/components/AddToolForm/index.tsx
mv src/common/forms/ToolEditForm.tsx src/app/\(app\)/tools/\[id\]/components/ToolEditForm/index.tsx
mv src/common/forms/ToolRequestForm.tsx src/app/\(app\)/tools/\[id\]/components/ToolRequestForm/index.tsx
```

**Update the moved form components:**

```typescript
// src/app/(app)/tools/add/components/AddToolForm/index.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { Textarea } from '@/primitives/textarea';
import { Select } from '@/primitives/select';
import { validateTool } from '../../validation/validateTool';

export function AddToolForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    availability_status: 'available' as const,
    location: '',
    images: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = validateTool(formData);
      
      const response = await fetch('/api/(app)/tools/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Redirect to tools list on success
      window.location.href = '/tools';
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Tool Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <Select
          id="category"
          value={formData.category_id}
          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
          required
        >
          <option value="">Select a category</option>
          {/* Category options will be populated from API */}
        </Select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium">
          Location
        </label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>

      {errors.general && (
        <div className="text-red-600 text-sm">{errors.general}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding Tool...' : 'Add Tool'}
      </Button>
    </form>
  );
}
```

### Step 5: Move Admin Forms

**Move admin-related forms to their respective pages:**

```bash
# Move admin forms
mv src/common/forms/CreateUserForm.tsx src/app/admin/users/components/CreateUserForm/index.tsx
mv src/common/forms/EditUserForm.tsx src/app/admin/users/\[userId\]/components/EditUserForm/index.tsx
mv src/common/forms/CategoryForm.tsx src/app/admin/categories/components/CategoryForm/index.tsx
mv src/common/forms/AttributeForm.tsx src/app/admin/attributes/components/AttributeForm/index.tsx
```

**Update the moved admin form components:**

```typescript
// src/app/admin/users/components/CreateUserForm/index.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Input } from '@/primitives/input';
import { Select } from '@/primitives/select';
import { validateUser } from '../../../api/admin/users/create/validateUser';

export function CreateUserForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = validateUser(formData);
      
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Reset form on success
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user'
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium">
          First Name
        </label>
        <Input
          id="first_name"
          value={formData.first_name}
          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium">
          Last Name
        </label>
        <Input
          id="last_name"
          value={formData.last_name}
          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <Select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {errors.general && (
        <div className="text-red-600 text-sm">{errors.general}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating User...' : 'Create User'}
      </Button>
    </form>
  );
}
```

### Step 6: Move Loan Forms

**Move loan-related forms to their respective pages:**

```bash
# Move loan forms
mv src/common/forms/LoanRequestForm.tsx src/app/\(app\)/tools/\[id\]/components/LoanRequestForm/index.tsx
mv src/common/forms/LoanActionForm.tsx src/app/\(app\)/loans/components/LoanActionForm/index.tsx
```

### Step 7: Update Import Statements

**Update all imports to use the new form locations:**

```bash
# Update imports for moved form files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/forms/LoginForm|@/app/auth/login/components/LoginForm|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/forms/RegisterForm|@/app/auth/register/components/RegisterForm|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/forms/AddToolForm|@/app/app/tools/add/components/AddToolForm|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/common/forms/CreateUserForm|@/admin/users/components/CreateUserForm|g'
```

### Step 8: Update Page Components

**Update page components to import forms from their new locations:**

```typescript
// src/app/(auth)/login/page.tsx
import { LoginForm } from './components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

```typescript
// src/app/(app)/tools/add/page.tsx
import { AddToolForm } from './components/AddToolForm';

export default function AddToolPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Tool</h1>
      <AddToolForm />
    </div>
  );
}
```

### Step 9: Remove Empty Forms Directory

**Clean up after moving all form files:**

```bash
# Remove empty forms directory
rmdir src/common/forms

# Remove any other empty directories created during the process
find src -type d -empty -delete
```

---

## 📋 Verification Checklist

### ✅ Form Colocation Verification

- [ ] All form components moved to their respective pages
- [ ] Forms colocated with where they're used
- [ ] Clear ownership of form logic
- [ ] No forms remaining in `src/common/forms/`
- [ ] Import statements updated to use new locations

### ✅ Form Functionality Verification

- [ ] All forms work correctly after moving
- [ ] Form validation working properly
- [ ] Form submission working correctly
- [ ] Error handling implemented in forms
- [ ] Loading states working properly

### ✅ Page Integration Verification

- [ ] Page components import forms from new locations
- [ ] Forms render correctly in pages
- [ ] Form styling and layout preserved
- [ ] Navigation between forms working
- [ ] Form state management working

---

## 🎯 Success Criteria

- ✅ All form components moved from `src/common/forms/` to their pages
- ✅ Forms colocated with where they're used
- ✅ Clear ownership of form logic
- ✅ Over-engineered form builders removed
- ✅ No forms remaining in common directory
- ✅ All imports updated to use new locations
- ✅ All forms working correctly
- ✅ All existing functionality preserved

---

## 🚨 Common Issues and Solutions

### Issue: Form Dependencies
**Problem:** Forms depend on utilities or components that were moved
**Solution:**
- Update import paths in moved forms
- Move shared utilities to appropriate locations
- Use relative imports where possible

### Issue: Form Styling
**Problem:** Form styling breaks after moving
**Solution:**
- Ensure CSS classes are still available
- Update any absolute import paths for styles
- Test form appearance in different contexts

### Issue: Form State Management
**Problem:** Form state management breaks after moving
**Solution:**
- Ensure form state is properly initialized
- Update any external state management references
- Test form state persistence

---

## 📚 Additional Resources

- [React Form Handling](https://react.dev/reference/react-dom/components/form)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Component Props](https://www.typescriptlang.org/docs/handbook/jsx.html)

---

*Phase 5 focuses on moving all form components from the scattered forms directory to be colocated with their respective pages, ensuring clear ownership and maintainability while removing over-engineered generic form builders.*
