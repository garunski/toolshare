# Phase 4: Notifications & Polish - Implementation Todo

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

## Phase 4 Tasks (Week 9-10)

### 4.1 Novu Notification System

#### Novu Setup & Integration
- [ ] Create `notificationWorkflowManager.ts`
- [ ] Create `novuSubscriberHandler.ts`
- [ ] Set up Novu Cloud account
- [ ] Configure API keys and environment variables
- [ ] Set up email and SMS providers in Novu dashboard
- [ ] Create notification templates for all user actions

#### Multi-Channel Notifications
- [ ] Create `loanReminderDispatcher.ts`
- [ ] Create `borrowingRequestNotifier.ts`
- [ ] Implement loan request notifications (email + in-app)
- [ ] Build overdue reminders with escalation (email → SMS → phone)
- [ ] Create return confirmations and thank you messages
- [ ] Add friend request and social notifications

#### Notification Workflows
- [ ] Create `reminderSequenceBuilder.ts`
- [ ] Create `escalationWorkflowManager.ts`
- [ ] Implement 24-hour loan reminders
- [ ] Build 1-hour before due reminders
- [ ] Create overdue escalation sequences
- [ ] Add welcome and onboarding sequences

### 4.2 In-App Notification Center

#### Novu Notification Center Integration
- [ ] Create `notificationCenterManager.ts`
- [ ] Create `userNotificationPreferences.ts`
- [ ] Integrate Novu's React notification center component
- [ ] Implement real-time in-app notifications with Supabase triggers
- [ ] Add user notification preferences and quiet hours
- [ ] Create notification history and mark as read functionality

### 4.3 Mobile Optimization

#### Progressive Web App
- [ ] Configure PWA with offline capabilities
- [ ] Optimize Catalyst UI layouts for mobile
- [ ] Implement camera integration for tool photos
- [ ] Add location services for nearby tools
- [ ] Create mobile-specific navigation
- [ ] Optimize touch interactions 