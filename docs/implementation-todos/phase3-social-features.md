# Phase 3: Social Features - Implementation Todo

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

## Phase 3 Tasks (Week 7-8)

### 3.1 User Network

#### Friend System
- [ ] Create `friendRequestProcessor.ts`
- [ ] Create `socialConnectionManager.ts`
- [ ] Build friend request system
- [ ] Implement friend connections management
- [ ] Create basic trust/reputation system
- [ ] Build user profiles with tool history
- [ ] Add friend discovery features

### 3.2 Communication

#### Messaging System
- [ ] Create `messageThreadManager.ts`
- [ ] Create `conversationFormatter.ts`
- [ ] Implement real-time messaging using Supabase
- [ ] Build loan-specific chat threads
- [ ] Add file sharing for loan documentation
- [ ] Create message notification system
- [ ] Implement conversation history 