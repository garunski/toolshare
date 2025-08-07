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
