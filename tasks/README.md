# Task Organization

This folder contains all the specialized task files for the toolshare project, organized by functionality.

## 📁 Task Files

### `Taskfile.setup.yml`
**Setup & Initialization Tasks**
- `install-deps` - Install all project dependencies
- `setup-env` - Set up environment variables
- `setup-supabase` - Initialize and start Supabase locally
- `install-supabase-cli` - Install Supabase CLI if not already installed

### `Taskfile.dev.yml`
**Development & Build Tasks**
- `build` - Build the application for production
- `start` - Start production server
- `lint` - Run ESLint to check code quality
- `lint-fix` - Run ESLint and automatically fix issues
- `type-check` - Run TypeScript type checking
- `test` - Run all tests
- `test-watch` - Run tests in watch mode

### `Taskfile.database.yml`
**Database & Supabase Tasks**
- `supabase-start/stop/status/reset` - Control Supabase services
- `db-migrate` - Apply database migrations
- `db-migrate-new` - Create a new migration file
- `db-seed` - Seed the database with initial data
- `db-types` - Generate TypeScript types from database schema
- `logs` - Show Supabase logs
- `studio` - Open Supabase Studio in browser

### `Taskfile.utils.yml`
**Utilities & Maintenance Tasks**
- `clean` - Clean build artifacts and temporary files
- `clean-all` - Deep clean (including node_modules)
- `monitor` - Monitor all services and show status
- `debug-env` - Debug environment variables

### `Taskfile.workflow.yml`
**Workflows & Deployment Tasks**
- `workflow-dev` - Complete development workflow
- `workflow-reset` - Reset development environment
- `workflow-full-reset` - Complete environment reset
- `workflow-db-reset` - Reset database and regenerate types
- `workflow-code-quality` - Run all code quality checks
- `deploy-staging/production` - Deployment tasks (future use)

## 🎯 Usage

All tasks can be accessed from the root directory using the main `Taskfile.yml`:

```bash
# Quick start
task setup
task dev-full
task status

# Database operations
task database:supabase-start
task database:db-migrate

# Development tasks
task dev:build
task dev:lint-fix

# Utilities
task utils:monitor
task utils:clean

# Workflows
task workflow:workflow-dev
task workflow:workflow-code-quality
```

## 📋 Benefits

- **🎯 Focused** - Each file has a clear, single responsibility
- **📖 Readable** - Easy to find and understand specific tasks
- **🔧 Maintainable** - Changes to one area don't affect others
- **🚀 Scalable** - Easy to add new task files for new functionality
- **👥 Team-friendly** - Different team members can work on different task files 