# Phase 1: Foundation - Implementation Todo

## Critical Development Standards

### Anti-Generic Naming Rule (MANDATORY)
- **NEVER use generic names**: "util", "utils", "helper", "helpers", "manager", "service", "common", "shared", "misc", "lib"
- **USE specific names**: `profileImageUploader.ts`, `borrowingRequestValidator.ts`, `toolAvailabilityCalculator.ts`
- **Directory structure**: `/operations`, `/validators`, `/formatters`, `/generators`, `/parsers`, `/transformers`, `/calculators`

### Code Quality Standards
- All files MUST be under 150 lines
- TypeScript with strict typing
- Comprehensive Zod validation
- Use existing components from `src/primitives/` (DO NOT modify third-party UI components)

---

## Phase 1 Tasks (Week 1-2)

### 1.1 Project Setup

#### Initialize Core Project
- [ ] Create Next.js 15 project with Catalyst UI
- [ ] Set up local Supabase project
- [ ] Configure TypeScript with strict mode
- [ ] Set up Tailwind CSS with Catalyst UI presets
- [ ] Configure ESLint rules for anti-generic naming enforcement

#### Authentication Foundation
- [ ] Set up Supabase Auth with email/password
- [ ] Create `authenticationFormValidator.ts`
- [ ] Create `sessionStateManager.ts`
- [ ] Build login page using Catalyst UI components
- [ ] Build register page using Catalyst UI components
- [ ] Create user profile creation with basic fields

### 1.2 Database Schema

#### Core Tables Setup
- [ ] Create Users table (handled by Supabase Auth)
- [ ] Create Profiles table (user profile data)
- [ ] Create Tools table (tool inventory)
- [ ] Create Loans table (borrowing records)
- [ ] Create Messages table (basic messaging)

#### Security & Types
- [ ] Set up Row Level Security policies for all tables
- [ ] Auto-generate TypeScript types using `supabase gen types typescript`
- [ ] Test database connections and permissions 