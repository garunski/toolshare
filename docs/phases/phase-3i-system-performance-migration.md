# Phase 3i: System and Performance Operations Migration

## 🎯 Objective
Move 12 system and performance operation files from `src/common/operations/` to be colocated with API routes in `/api/admin/system/`. Run `task validate` after each task and fix all issues

---

## 📋 Files to Migrate (12 files)

### 1. `systemHealthMonitor.ts` → `/api/admin/system/health/monitorHealth.ts`
**Size:** 3.4KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/health/`
- [ ] Copy `systemHealthMonitor.ts` to `monitorHealth.ts`
- [ ] Refactor function names to be specific (e.g., `monitorHealth`, `checkSystemHealth`, `getHealthStatus`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add system health monitoring logic
- [ ] Add health check endpoints and metrics
- [ ] Add health status reporting and alerts
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `systemHealthMonitor.ts`

### 2. `performanceMonitoringService.ts` → `/api/admin/system/performance/monitorPerformance.ts`
**Size:** 3.2KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/performance/`
- [ ] Copy `performanceMonitoringService.ts` to `monitorPerformance.ts`
- [ ] Refactor function names to be specific (e.g., `monitorPerformance`, `trackPerformanceMetrics`, `analyzePerformance`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add performance monitoring logic
- [ ] Add performance metrics collection
- [ ] Add performance analysis and reporting
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `performanceMonitoringService.ts`

### 3. `performanceMonitoringHelpers.ts` → `/api/admin/system/performance/helpers/performanceHelpers.ts`
**Size:** 2.0KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/performance/helpers/`
- [ ] Copy `performanceMonitoringHelpers.ts` to `performanceHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `performanceHelpers`, `formatPerformanceData`, `calculatePerformanceMetrics`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add performance helper functions
- [ ] Add performance data formatting utilities
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `performanceMonitoringHelpers.ts`
- [ ] Test performance helpers functionality

### 4. `queryOptimizationService.ts` → `/api/admin/system/optimization/optimizeQueries.ts`
**Size:** 3.4KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/optimization/`
- [ ] Copy `queryOptimizationService.ts` to `optimizeQueries.ts`
- [ ] Refactor function names to be specific (e.g., `optimizeQueries`, `analyzeQueryPerformance`, `suggestQueryOptimizations`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add query optimization logic
- [ ] Add query performance analysis
- [ ] Add query optimization suggestions
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `queryOptimizationService.ts`

### 5. `queryOptimizationHelpers.ts` → `/api/admin/system/optimization/helpers/optimizationHelpers.ts`
**Size:** 1.8KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/optimization/helpers/`
- [ ] Copy `queryOptimizationHelpers.ts` to `optimizationHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `optimizationHelpers`, `formatQueryPlan`, `analyzeQueryMetrics`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add query optimization helper functions
- [ ] Add query analysis utilities
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `queryOptimizationHelpers.ts`

### 6. `rateLimitHelpers.ts` → `/api/admin/system/rateLimit/helpers/rateLimitHelpers.ts`
**Size:** 2.5KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/rateLimit/helpers/`
- [ ] Copy `rateLimitHelpers.ts` to `rateLimitHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `rateLimitHelpers`, `checkRateLimit`, `updateRateLimit`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add rate limiting helper functions
- [ ] Add rate limit checking and management
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `rateLimitHelpers.ts`

### 7. `imageOptimizationHelpers.ts` → `/api/admin/system/images/helpers/imageHelpers.ts`
**Size:** 3.2KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/images/helpers/`
- [ ] Copy `imageOptimizationHelpers.ts` to `imageHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `imageHelpers`, `optimizeImage`, `processImage`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add image optimization helper functions
- [ ] Add image processing utilities
- [ ] Add image format conversion helpers
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `imageOptimizationHelpers.ts`

### 8. `realtimeNotifications.ts` → `/api/admin/system/notifications/sendNotifications.ts`
**Size:** 3.0KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/notifications/`
- [ ] Copy `realtimeNotifications.ts` to `sendNotifications.ts`
- [ ] Refactor function names to be specific (e.g., `sendNotifications`, `broadcastNotification`, `manageNotifications`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add real-time notification logic
- [ ] Add notification broadcasting and delivery
- [ ] Add notification management and scheduling
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `realtimeNotifications.ts`

### 9. `realtimeConnectionHelpers.ts` → `/api/admin/system/realtime/helpers/connectionHelpers.ts`
**Size:** 725B | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/realtime/helpers/`
- [ ] Copy `realtimeConnectionHelpers.ts` to `connectionHelpers.ts`
- [ ] Refactor function names to be specific (e.g., `connectionHelpers`, `manageConnections`, `handleConnection`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add real-time connection helper functions
- [ ] Add connection management utilities
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `realtimeConnectionHelpers.ts`

### 10. `offlineStorageManager.ts` → `/api/admin/system/storage/manageOfflineStorage.ts`
**Size:** 3.9KB | **Complexity:** High

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/storage/`
- [ ] Copy `offlineStorageManager.ts` to `manageOfflineStorage.ts`
- [ ] Refactor function names to be specific (e.g., `manageOfflineStorage`, `syncOfflineData`, `handleOfflineStorage`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add offline storage management logic
- [ ] Add data synchronization functionality
- [ ] Add offline data handling and conflict resolution
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `offlineStorageManager.ts`

### 11. `multiTenantManager.ts` → `/api/admin/system/tenants/manageTenants.ts`
**Size:** 1.4KB | **Complexity:** Medium

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/tenants/`
- [ ] Copy `multiTenantManager.ts` to `manageTenants.ts`
- [ ] Refactor function names to be specific (e.g., `manageTenants`, `handleTenantOperations`, `configureTenant`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add multi-tenant management logic
- [ ] Add tenant configuration and isolation
- [ ] Add tenant-specific operations
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `multiTenantManager.ts`

### 12. `tenantConfigManager.ts` → `/api/admin/system/tenants/config/manageTenantConfig.ts`
**Size:** 1.0KB | **Complexity:** Low

**Subtasks:**
- [ ] Create directory: `src/app/api/admin/system/tenants/config/`
- [ ] Copy `tenantConfigManager.ts` to `manageTenantConfig.ts`
- [ ] Refactor function names to be specific (e.g., `manageTenantConfig`, `updateTenantConfig`, `getTenantConfig`)
- [ ] Update imports to use `@/common/supabase/server`
- [ ] Add tenant configuration management logic
- [ ] Add configuration validation and updates
- [ ] Create corresponding `route.ts` file
- [ ] Update all imports in codebase that reference `tenantConfigManager.ts`

---

## 🚀 Implementation Steps

### Step 1: Create Directory Structure
```bash
mkdir -p src/app/api/admin/system/health
mkdir -p src/app/api/admin/system/performance
mkdir -p src/app/api/admin/system/performance/helpers
mkdir -p src/app/api/admin/system/optimization
mkdir -p src/app/api/admin/system/optimization/helpers
mkdir -p src/app/api/admin/system/rateLimit/helpers
mkdir -p src/app/api/admin/system/images/helpers
mkdir -p src/app/api/admin/system/notifications
mkdir -p src/app/api/admin/system/realtime/helpers
mkdir -p src/app/api/admin/system/storage
mkdir -p src/app/api/admin/system/tenants
mkdir -p src/app/api/admin/system/tenants/config
```

### Step 2: Move Files One by One
Follow the subtasks for each file above, moving them in order of complexity (Low → Medium → High).

### Step 3: Update Imports
After each file is moved, update all imports in the codebase that reference the old location.

### Step 4: Create Route Files
For each moved operation file, create a corresponding `route.ts` file that uses the business logic.

### Step 5: Test Each Migration
After each file is moved, test the functionality to ensure it works correctly.

---

## 📋 Verification Checklist

### ✅ File Migration Verification
- [ ] All 12 system and performance operation files moved to appropriate API routes
- [ ] All function names refactored to be specific and descriptive
- [ ] All imports updated to use `@/common/supabase/server`
- [ ] All corresponding `route.ts` files created
- [ ] All imports in codebase updated to reference new locations

### ✅ Code Quality Verification
- [ ] Run `task validate` to ensure no TypeScript errors
- [ ] Run `task dev:code-quality` to ensure code quality standards
- [ ] All business logic preserved after moving
- [ ] No functionality broken

---

## 🎯 Success Criteria

- ✅ All 12 system and performance operation files moved to `/api/admin/system/` structure
- ✅ Business logic colocated with API endpoints
- ✅ All imports updated to use new locations
- ✅ All corresponding route files created
- ✅ All functionality preserved and working
- ✅ Run `task validate` to ensure no breaking changes

---

*Phase 3i focuses on moving all system and performance business logic to be colocated with their respective API routes, ensuring clear ownership and maintainability.*
