# ToolShare Refactoring Plan

## 🚨 Current Problems

The ToolShare application has fundamental architectural issues:

1. **Massive `src/common/` Directory (Anti-Pattern)**
   - 60+ business logic files scattered in `operations/`
   - 15+ over-engineered form files in `forms/`
   - 20+ hooks that should be colocated in `hooks/`
   - 15+ validation files not with forms/APIs in `validators/`
   - Empty abstraction directories (`calculators/`, `generators/`, etc.)

2. **API Routes are Wrong**
   - Single files handling multiple operations (e.g., `tools/route.ts` handles GET, POST, PUT, DELETE)
   - Mixed responsibilities and large file sizes
   - No proper verb/intent structure

3. **Pages Contain Business Logic**
   - Pages call business logic directly (e.g., `ToolDataProcessor.getUserTools()`)
   - Client-side data fetching in pages
   - Mixed UI and business concerns

4. **No Route Group Organization**
   - All pages mixed together without proper sectioning
   - No separation between public, auth, admin, and app sections

## 🎯 Target Architecture

```
src/
├── app/
│   ├── (public)/                    # Non-authenticated public pages
│   ├── (auth)/                      # Authentication process
│   ├── admin/                       # Admin-only section
│   ├── (app)/                       # Authenticated app section
│   └── api/                         # API routes (organized by section)
│       ├── (public)/               # Public APIs
│       ├── (auth)/                 # Authentication APIs
│       ├── admin/                   # Admin APIs
│       └── (app)/                  # App APIs
├── common/
│   └── supabase/                   # Only truly shared code
└── primitives/                     # UI primitives
```

## 📋 10-Phase Refactoring Strategy

### Phase 1: Organize Application Sections with Route Groups
**Problem:** No proper sectioning of the application
**Solution:** Use Next.js route groups with parentheses to organize sections

### Phase 2: Destroy the `src/common/` Directory
**Problem:** Everything is in the wrong place
**Solution:** Move everything to where it actually belongs

### Phase 3: Move Business Logic to API Routes
**Current:** Business logic in `src/common/operations/`
**Target:** Business logic colocated with API routes

### Phase 4: Move Validation to Where It's Used
**Current:** Validation in `src/common/validators/`
**Target:** Validation colocated with forms and APIs

### Phase 5: Move Form Components to Their Pages
**Current:** Forms in `src/common/forms/`
**Target:** Forms colocated with their pages

### Phase 6: Move Hooks to Their Components
**Current:** Hooks in `src/common/hooks/`
**Target:** Hooks colocated with their usage

### Phase 7: Extract Data Fetching from Pages
**Current:** Pages contain business logic
**Target:** Pages only contain UI orchestration

### Phase 8: Implement Middleware and Route Protection
**Problem:** No middleware protection on API routes
**Solution:** Implement per-route-group middleware with authentication, authorization, and rate limiting

### Phase 9: Restructure API Routes by Verb/Intent
**Problem:** API routes not following verb/intent structure
**Solution:** Reorganize API routes to follow explicit verb/intent naming with proper file size limits

### Phase 10: Enforce File Size Limits and Quality Standards
**Problem:** Files exceed size limits and lack quality standards
**Solution:** Configure ESLint rules and plugins to enforce file size limits, component organization, and quality standards

## 🎯 Success Criteria

- ✅ `src/common/` only contains truly shared code (Supabase)
- ✅ Proper route group organization with parentheses
- ✅ All API routes follow verb/intent structure within their sections
- ✅ All business logic colocated with API routes
- ✅ All validation colocated with forms/APIs
- ✅ All form components colocated with their pages
- ✅ All hooks colocated with their components
- ✅ Pages only contain UI orchestration
- ✅ Server-side data fetching for all pages
- ✅ All API routes have mandatory middleware protection
- ✅ File size limits enforced (150 lines for pages, 100 for APIs)
- ✅ Business logic extraction follows reuse + meaning principle
- ✅ Validation schemas properly shared between client/server
- ✅ Components follow explicit naming and organization patterns
- ✅ No operation wrapper classes
- ✅ No generic form builders
- ✅ Clear separation between public, auth, admin, and app sections
- ✅ Concise naming without redundancy

## ❌ What NOT to Do

- ❌ Don't create new abstraction layers
- ❌ Don't keep anything in `src/common/` that's not truly shared
- ❌ Don't create generic utilities
- ❌ Don't add middleware until colocation is complete
- ❌ Don't refactor working code that's already colocated
- ❌ Don't mix sections without proper route group organization
- ❌ Don't use `shared/`, `utils/`, `helpers/`, or `lib/` directories
- ❌ Don't repeat context in filenames that's already clear from folder structure
