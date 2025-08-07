# Phase 2: Destroy the `src/common/` Directory

## 🎯 Objective
Move everything from `src/common/` to where it actually belongs, eliminating the anti-pattern of scattered business logic, forms, hooks, and validators.

---

## 🚨 Current State Analysis

**Problem:** Everything is in the wrong place
```
src/common/
├── operations/ (60+ files) - Business logic scattered everywhere
├── forms/ (15+ files) - Over-engineered form system
├── hooks/ (20+ files) - Hooks that should be colocated
├── validators/ (15+ files) - Validation not with forms/APIs
├── components/ (2 files) - Should be in pages
├── formatters/ (4 files) - Utilities that should be colocated
├── calculators/ (empty) - Meaningless abstraction
├── generators/ (empty) - Meaningless abstraction
├── parsers/ (empty) - Meaningless abstraction
├── transformers/ (empty) - Meaningless abstraction
└── supabase/ (3 files) - Only thing that should stay shared
```

**Impact:**
- Business logic scattered across 60+ files
- Forms over-engineered and not colocated
- Hooks not with their components
- Validation not with forms/APIs
- No clear ownership of code
- Difficult to maintain and understand

---

## 🚀 Step-by-Step Implementation

### Step 1: Identify What to Keep vs Move

**KEEP in `src/common/supabase/`:**
```
src/common/supabase/
├── client.ts - Supabase client configuration
├── server.ts - Server-side Supabase client
└── middleware.ts - Supabase middleware utilities
```

**MOVE everything else:**
```
src/common/operations/ → Move to API routes (Phase 3)
src/common/forms/ → Move to pages (Phase 5)
src/common/hooks/ → Move to components (Phase 6)
src/common/validators/ → Move to forms/APIs (Phase 4)
src/common/components/ → Move to pages
src/common/formatters/ → Move to where used
src/common/calculators/ → DELETE (empty)
src/common/generators/ → DELETE (empty)
src/common/parsers/ → DELETE (empty)
src/common/transformers/ → DELETE (empty)
```

### Step 2: Create Backup and Analysis

**Before moving anything, create a backup and analyze dependencies:**

```bash
# Create backup of current common directory
cp -r src/common src/common.backup

# Analyze what's in each directory
find src/common -name "*.ts" -o -name "*.tsx" | head -20

# Check import dependencies
grep -r "from '@/common" src/ | head -20
```

### Step 3: Move Supabase Files to New Location

**Create the new supabase directory structure:**

```bash
# Create new supabase directory
mkdir -p src/common/supabase

# Move existing supabase files
mv src/common/supabase/client.ts src/common/supabase/client.ts
mv src/common/supabase/server.ts src/common/supabase/server.ts
mv src/common/supabase/middleware.ts src/common/supabase/middleware.ts
```

### Step 4: Prepare Directories for Other Phases

**Create placeholder directories for other phases to move files to:**

```bash
# Create directories for Phase 3 (Business Logic)
mkdir -p src/app/api/\(app\)/tools/create
mkdir -p src/app/api/\(app\)/tools/list
mkdir -p src/app/api/admin/users/create
mkdir -p src/app/api/admin/users/list

# Create directories for Phase 4 (Validation)
mkdir -p src/app/\(app\)/tools/add/validation
mkdir -p src/app/\(auth\)/login/validation
mkdir -p src/app/\(auth\)/register/validation

# Create directories for Phase 5 (Forms)
mkdir -p src/app/\(app\)/tools/add/components
mkdir -p src/app/\(auth\)/login/components
mkdir -p src/app/\(auth\)/register/components

# Create directories for Phase 6 (Hooks)
mkdir -p src/app/\(app\)/tools/add/hooks
mkdir -p src/app/\(app\)/tools/browse/hooks
mkdir -p src/app/admin/users/hooks
```

### Step 5: Delete Empty Directories

**Remove meaningless abstraction directories:**

```bash
# Delete empty directories
rm -rf src/common/calculators
rm -rf src/common/generators
rm -rf src/common/parsers
rm -rf src/common/transformers
```

### Step 6: Document What Needs to Be Moved

**Create a migration plan for other phases:**

```bash
# Create migration tracking file
cat > PHASE2_MIGRATION_PLAN.md << 'EOF'
# Phase 2 Migration Plan

## Files to be moved in Phase 3 (Business Logic)
- src/common/operations/toolCRUD.ts → src/app/api/(app)/tools/create/performTool.ts
- src/common/operations/toolQueries.ts → src/app/api/(app)/tools/list/getTools.ts
- src/common/operations/userCreation.ts → src/app/api/admin/users/create/performUser.ts
- src/common/operations/roleAssignments.ts → src/app/api/admin/roles/assign/performRoleAssignment.ts
- (60+ other operation files)

## Files to be moved in Phase 4 (Validation)
- src/common/validators/toolCreationValidator.ts → src/app/(app)/tools/add/validation/validateTool.ts
- src/common/validators/loginValidator.ts → src/app/(auth)/login/validation/validateLogin.ts
- src/common/validators/registerValidator.ts → src/app/(auth)/register/validation/validateRegister.ts
- (15+ other validator files)

## Files to be moved in Phase 5 (Forms)
- src/common/forms/AddToolForm.tsx → src/app/(app)/tools/add/components/AddToolForm/index.tsx
- src/common/forms/RegisterForm.tsx → src/app/(auth)/register/components/RegisterForm/index.tsx
- src/common/forms/LoginForm.tsx → src/app/(auth)/login/components/LoginForm/index.tsx
- DELETE: FormBuilder.tsx, MultiStepFormBuilder.tsx, DynamicFormBuilder.tsx

## Files to be moved in Phase 6 (Hooks)
- src/common/hooks/useAddToolForm.ts → src/app/(app)/tools/add/hooks/useAddToolForm.ts
- src/common/hooks/useCategorySuggestions.ts → src/app/(app)/tools/add/hooks/useCategorySuggestions.ts
- src/common/hooks/useToolSearch.ts → src/app/(app)/tools/browse/hooks/useToolSearch.ts
- src/common/hooks/useAuth.ts → src/common/supabase/hooks/useAuth.ts
- (20+ other hook files)

## Files to be moved immediately
- src/common/components/ → Move to appropriate pages
- src/common/formatters/ → Move to where used
EOF
```

---

## 📋 Verification Checklist

### ✅ Directory Structure Verification

- [ ] `src/common/supabase/` contains only shared Supabase files
- [ ] Empty directories (calculators, generators, parsers, transformers) deleted
- [ ] Migration plan document created
- [ ] Backup of original common directory created
- [ ] Directories prepared for other phases

### ✅ File Analysis Verification

- [ ] All files in common directory analyzed
- [ ] Dependencies documented
- [ ] Import statements identified
- [ ] No files accidentally deleted
- [ ] Backup accessible for rollback

### ✅ Preparation Verification

- [ ] Target directories created for other phases
- [ ] Migration plan documented
- [ ] No business logic moved yet (waiting for Phase 3)
- [ ] No validation moved yet (waiting for Phase 4)
- [ ] No forms moved yet (waiting for Phase 5)
- [ ] No hooks moved yet (waiting for Phase 6)

---

## 🎯 Success Criteria

- ✅ `src/common/` only contains `supabase/` directory
- ✅ Empty abstraction directories removed
- ✅ Migration plan documented for other phases
- ✅ Backup created for safety
- ✅ Target directories prepared for other phases
- ✅ No files moved to wrong locations
- ✅ Clear separation of concerns established

---

## 🚨 Common Issues and Solutions

### Issue: Circular Dependencies
**Problem:** Moving files creates circular import dependencies
**Solution:** 
- Analyze dependencies before moving
- Move files in dependency order
- Use dependency injection where necessary

### Issue: Missing Files
**Problem:** Files accidentally deleted during cleanup
**Solution:**
- Always create backup first
- Use `git status` to track changes
- Test after each step

### Issue: Import Paths
**Problem:** Import statements break after moving files
**Solution:**
- Update imports in other phases
- Use search and replace for common patterns
- Run TypeScript compiler to catch errors

---

## 📚 Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [React Component Organization](https://react.dev/learn/thinking-in-react)

---

*Phase 2 focuses on preparing the destruction of the common directory by identifying what needs to be moved, creating the proper structure, and documenting the migration plan for subsequent phases.*
