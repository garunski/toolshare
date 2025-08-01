# Tool Sharing Platform - Implementation Todos

## Overview

This directory contains the implementation todo files for each phase of the Tool Sharing Platform development. Each phase is designed to be completed in 2 weeks, with a total timeline of 12 weeks.

## Phase Structure

### Phase 1: Foundation (Week 1-2)
**File**: `phase1-foundation.md`
- Project setup with Next.js 15 and Catalyst UI
- Supabase authentication and database schema
- Core infrastructure and development standards

### Phase 2: Core Features (Week 3-6)
**File**: `phase2-core-features.md`
- Tool management system (add, search, discover)
- Borrowing system (requests, tracking, returns)
- Core user workflows and interactions

### Phase 3: Social Features (Week 7-8)
**File**: `phase3-social-features.md`
- Friend system and user networks
- Real-time messaging and communication
- Social connections and trust building

### Phase 4: Notifications & Polish (Week 9-10)
**File**: `phase4-notifications-polish.md`
- Novu notification system integration
- Multi-channel notifications (email, SMS, in-app)
- Mobile optimization and PWA features

### Phase 5: Advanced Features (Week 11-12)
**File**: `phase5-advanced-features.md`
- Analytics and insights dashboard
- Enhanced security and verification
- Performance optimization

## Critical Development Standards

All phases follow these mandatory standards:

### Anti-Generic Naming Rule
- **NEVER use generic names**: "util", "utils", "helper", "helpers", "manager", "service", "common", "shared", "misc", "lib"
- **USE specific names**: `profileImageUploader.ts`, `borrowingRequestValidator.ts`, `toolAvailabilityCalculator.ts`
- **Directory structure**: `/operations`, `/validators`, `/formatters`, `/generators`, `/parsers`, `/transformers`, `/calculators`

### Code Quality Standards
- All files MUST be under 150 lines
- TypeScript with strict typing
- Comprehensive Zod validation
- Use existing components from `src/primitives/` (DO NOT modify third-party UI components)

## Technology Stack

- **Frontend**: Next.js 15 App Router + Catalyst UI
- **Backend**: Supabase Cloud
- **Database**: PostgreSQL via Supabase
- **Notifications**: Novu
- **Deployment**: Vercel (recommended) or Digital Ocean

## Getting Started

1. Start with Phase 1 to set up the foundation
2. Complete each phase in order
3. Each phase builds upon the previous one
4. Follow the critical development standards strictly
5. Keep tasks simple and focused on MVP functionality 