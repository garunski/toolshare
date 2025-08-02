# ToolShare

A community-driven tool sharing platform that connects neighbors and friends to share tools, build relationships, and create stronger communities.

## Features

- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Profile Management**: Complete user profiles with contact information
- **Tool Management**: Add, edit, and manage your tool inventory
- **Community Building**: Connect with neighbors and build trust networks
- **Real-time Messaging**: Communicate with other users
- **Loan Tracking**: Manage borrowing requests and track tool returns
- **Notifications**: Multi-channel notifications for important events

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **UI Components**: Catalyst UI (shadcn/ui based)
- **Styling**: Tailwind CSS with Catalyst presets
- **Backend**: Supabase Cloud (PostgreSQL, Auth, Storage, Real-time)
- **Notifications**: Novu Cloud
- **Language**: TypeScript (strict mode)
- **Forms**: React Hook Form with Zod validation
- **Development**: Taskfile for streamlined workflows

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI
- Novu account (for notifications)

### Quick Start with Taskfile

The easiest way to get started is using the included Taskfile:

```bash
# Install Taskfile (if not already installed)
brew install go-task

# Complete project setup
task setup

# Start development server with Supabase
task dev
```

### Manual Setup

If you prefer to set up manually:

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd toolshare
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` and add your Supabase and Novu credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NOVU_API_KEY=your_novu_api_key
   NEXT_PUBLIC_NOVU_APP_ID=your_novu_app_id
   ```

4. **Set up Supabase Database**

   ```bash
   # Start Supabase locally
   task database:supabase-start

   # Apply migrations
   task database:db-migrate

   # Generate TypeScript types
   task database:db-types

   # Seed with test data
   task database:db-seed-users
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── components/     # Page-specific components
│   │   ├── register/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   └── profile-setup/
│   │       ├── page.tsx
│   │       └── components/
│   └── dashboard/
│       ├── page.tsx
│       └── components/
├── common/                 # Shared utilities (singular)
│   ├── validators/        # Zod validation schemas
│   ├── operations/        # Business logic operations
│   ├── formatters/        # Data formatting functions
│   ├── generators/        # Content generation
│   ├── parsers/           # Data parsing
│   ├── transformers/      # Data transformation
│   └── calculators/       # Calculation functions
├── components/            # Shared components
│   └── ui/               # UI components (camelCase)
├── hook/                 # Custom React hooks (singular)
└── type/                 # TypeScript type definitions (singular)

supabase/
├── migrations/           # Database migrations
├── seed.sql             # SQL seed data
├── seed-users.ts        # TypeScript user seeding
├── seed-data.ts         # TypeScript data seeding
└── config.toml          # Supabase configuration
```

## Development Standards

### Component Placement

- **Page-specific components**: Co-located in `src/app/[page]/components/`
- **Shared components**: Located in `src/components/`
- **UI components**: Located in `src/components/ui/`
- **Third-party components**: Imported from their packages

### Code Quality Standards

- **File Size**: All files MUST be under 150 lines
- **TypeScript**: Strict mode with proper typing
- **Validation**: Comprehensive Zod schemas for all data
- **Naming**: Consistent camelCase/PascalCase conventions
- **Organization**: Single responsibility principle

### Anti-Generic Naming Rule

- **NEVER use generic names**: "util", "utils", "helper", "helpers", "manager", "service", "common", "shared", "misc", "lib"
- **USE specific names**: `profileImageUploader.ts`, `borrowingRequestValidator.ts`, `toolAvailabilityCalculator.ts`

## Taskfile Commands

The project includes a comprehensive Taskfile for common development tasks:

### 🚀 Setup & Development

- `task setup` - Complete project setup
- `task dev` - Start development server with Supabase
- `task dev:dev-only` - Start Next.js dev server only
- `task dev:build` - Build for production
- `task dev:start` - Start production server

### 🗄️ Database

- `task database:supabase-start` - Start Supabase services
- `task database:supabase-stop` - Stop Supabase services
- `task database:supabase-status` - Check Supabase status
- `task database:supabase-reset` - Reset Supabase database
- `task database:db-migrate` - Apply database migrations
- `task database:db-migrate-new` - Create new migration
- `task database:db-seed` - Seed database with initial data
- `task database:db-seed-users` - Create test users and sample data
- `task database:db-types` - Generate TypeScript types

### 🧪 Testing & Quality

- `task dev:lint` - Run ESLint
- `task dev:lint-fix` - Fix ESLint issues
- `task dev:format` - Format code with Prettier
- `task dev:format-check` - Check code formatting
- `task dev:format-fix` - Format and fix linting
- `task dev:type-check` - Run TypeScript checks
- `task workflow:workflow-code-quality` - Run all quality checks
- `task workflow:workflow-code-fix` - Fix all quality issues

### 📊 Utilities

- `task status` - Show project status
- `task database:logs` - Show Supabase logs
- `task database:studio` - Open Supabase Studio
- `task help` - Show detailed help

## Development Workflow

### Code Quality Operations

**IMPORTANT: All code quality operations MUST be run using Taskfile commands.**

```bash
# Run all quality checks
task workflow:workflow-code-quality

# Fix all quality issues
task workflow:workflow-code-fix

# Individual operations
task dev:lint          # Run ESLint
task dev:lint-fix      # Fix linting issues
task dev:type-check    # Run TypeScript checks
task dev:format        # Format code
```

### Component Development

1. **Page-specific components**: Create in `src/app/[page]/components/`
2. **Shared components**: Create in `src/components/`
3. **UI components**: Use existing components from `src/components/ui/`
4. **Follow naming conventions**: PascalCase for components, camelCase for utilities

### Database Development

```bash
# Create new migration
task database:db-migrate-new

# Apply migrations
task database:db-migrate

# Generate types
task database:db-types

# Seed data
task database:db-seed-users
```

## Contributing

1. Follow the component placement rules
2. Keep files under 150 lines
3. Use TypeScript with strict typing
4. Implement comprehensive Zod validation
5. Follow the established project structure
6. Use Taskfile commands for all development operations

## License

This project is licensed under the MIT License.
