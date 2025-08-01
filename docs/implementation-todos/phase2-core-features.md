# Phase 2: Core Features - Implementation Todo

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

## Phase 2 Tasks (Week 3-6)

### 2.1 Tool Management

#### Add Tool Interface
- [ ] Create `toolCreationValidator.ts`
- [ ] Create `toolImageUploader.ts`
- [ ] Build multi-step form using Catalyst UI components
- [ ] Implement photo upload to Supabase Storage
- [ ] Add tool categorization system
- [ ] Implement tool condition tracking

#### Tool Discovery
- [ ] Create `toolSearchProcessor.ts`
- [ ] Create `availabilityStatusFormatter.ts`
- [ ] Build search and filter interface using Catalyst UI
- [ ] Create tool detail pages with image galleries
- [ ] Implement location-based discovery
- [ ] Add tool availability status display

### 2.2 Borrowing System

#### Request Management
- [ ] Create `borrowingRequestValidator.ts`
- [ ] Create `loanStatusTracker.ts`
- [ ] Build request workflow with approval/denial
- [ ] Implement real-time status updates using Supabase subscriptions
- [ ] Create basic messaging between lender/borrower
- [ ] Add request notification system

#### Loan Tracking
- [ ] Create `returnProcessHandler.ts`
- [ ] Create `loanHistoryFormatter.ts`
- [ ] Build active loan dashboard
- [ ] Implement return process with condition assessment
- [ ] Create simple rating system
- [ ] Add loan history tracking 