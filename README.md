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
- **UI Components**: shadcn/ui (based on Radix UI)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Notifications**: Novu
- **Language**: TypeScript
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker Desktop
- Supabase CLI
- Novu account (for notifications)

### Quick Start with Taskfile

The easiest way to get started is using the included Taskfile:

```bash
# Install Taskfile (if not already installed)
brew install go-task

# Complete environment setup
task setup:env

# Start development server with Supabase
task dev:with:supabase
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

   Create a new Supabase project and run the following SQL in the SQL editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     first_name TEXT NOT NULL,
     last_name TEXT NOT NULL,
     phone TEXT,
     address TEXT,
     bio TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create tools table
   CREATE TABLE tools (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     name TEXT NOT NULL,
     description TEXT,
     category TEXT,
     condition TEXT,
     images TEXT[],
     is_available BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create loans table
   CREATE TABLE loans (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
     borrower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     lender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     status TEXT DEFAULT 'pending',
     start_date DATE,
     end_date DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create messages table
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     content TEXT NOT NULL,
     loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
   ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   -- Profiles: Users can read all profiles, update their own
   CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

   -- Tools: Users can read all available tools, manage their own
   CREATE POLICY "Users can view available tools" ON tools FOR SELECT USING (is_available = true);
   CREATE POLICY "Users can manage own tools" ON tools FOR ALL USING (auth.uid() = owner_id);

   -- Loans: Users can view loans they're involved in
   CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = borrower_id OR auth.uid() = lender_id);
   CREATE POLICY "Users can create loans" ON loans FOR INSERT WITH CHECK (auth.uid() = borrower_id);

   -- Messages: Users can view messages they're involved in
   CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
   CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
   ```

5. **Generate TypeScript types**

   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── ...
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── catalyst/         # Catalyst UI components
│   └── custom/           # Custom components
├── lib/
│   ├── operations/       # Business logic operations
│   ├── validators/       # Zod validation schemas
│   ├── formatters/       # Data formatting functions
│   ├── generators/       # Content generation
│   ├── parsers/          # Data parsing
│   ├── transformers/     # Data transformation
│   └── calculators/      # Calculation functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Development Standards

### Anti-Generic Naming Rule

- **NEVER use generic names**: "util", "utils", "helper", "helpers", "manager", "service", "common", "shared", "misc", "lib"
- **USE specific names**: `profileImageUploader.ts`, `borrowingRequestValidator.ts`, `toolAvailabilityCalculator.ts`

### Code Quality Standards

- All files MUST be under 150 lines
- TypeScript with strict typing
- Comprehensive Zod validation
- Use existing components from `src/components/ui/` (DO NOT modify third-party UI components)

## Taskfile Commands

The project includes a comprehensive Taskfile for common development tasks:

### 🚀 Setup & Development

- `task setup:env` - Complete environment setup
- `task dev` - Start development server
- `task dev:with:supabase` - Start dev server with Supabase

### 🗄️ Database

- `task supabase:setup` - Setup Supabase locally
- `task supabase:start` - Start Supabase services
- `task supabase:stop` - Stop Supabase services
- `task supabase:db:setup` - Setup database schema
- `task supabase:db:seed` - Seed database with sample data
- `task supabase:types:generate` - Generate TypeScript types

### 🧪 Testing

- `task test` - Run tests
- `task test:watch` - Run tests in watch mode

### 🧹 Maintenance

- `task clean` - Clean build artifacts
- `task clean:all` - Complete cleanup
- `task lint` - Run ESLint
- `task lint:fix` - Fix ESLint issues

### 📊 Utilities

- `task status` - Show project status
- `task logs` - Show application logs
- `task help` - Show all available tasks

## Contributing

1. Follow the anti-generic naming rules
2. Keep files under 150 lines
3. Use TypeScript with strict typing
4. Implement comprehensive Zod validation
5. Follow the established project structure

## License

This project is licensed under the MIT License.
