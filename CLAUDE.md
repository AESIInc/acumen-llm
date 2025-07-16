# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Turbo mode
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js ESLint and Biome linter (auto-fix)
- `pnpm lint:fix` - Run linting with auto-fix
- `pnpm format` - Format code with Biome
- `pnpm test` - Run Playwright end-to-end tests

### Database Commands
- `pnpm db:generate` - Generate Drizzle schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:push` - Push schema to database
- `pnpm db:pull` - Pull schema from database

### Testing
- Tests are located in `tests/` directory
- Uses Playwright for E2E testing
- Test files: `tests/e2e/*.test.ts`
- Helper utilities in `tests/helpers.ts` and `tests/fixtures.ts`

## Architecture Overview

### Core Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth + Next-Auth hybrid
- **AI Integration**: Vercel AI SDK with multiple providers
- **Styling**: Tailwind CSS with shadcn/ui components
- **Code Quality**: Biome for linting and formatting

### Key Directory Structure
- `app/` - Next.js App Router structure
  - `(auth)/` - Authentication pages and actions
  - `(auth-js)/` - Next-Auth integration
  - `(chat)/` - Main chat interface and API routes
- `components/` - React components (UI + business logic)
- `lib/` - Core utilities and configurations
  - `ai/` - AI model providers and tools
  - `db/` - Database schema and queries
  - `supabase/` - Supabase client configuration
- `artifacts/` - AI-generated artifact handling
- `hooks/` - Custom React hooks

### AI Integration
- **Models**: Configurable AI providers (OpenAI, Google, test models)
- **Tools**: Built-in tools for document creation, weather, and web scraping
- **Reasoning**: Support for reasoning models with middleware
- **Artifacts**: System for generating and managing code/text/image artifacts

### Database Schema
- **Users**: Regular and guest user support
- **Chats**: Conversation management with public/private visibility
- **Messages**: Message parts system (v2 schema)
- **Documents**: Artifact storage with versioning
- **Suggestions**: Collaborative editing suggestions
- **Votes**: Message voting system

### Authentication Flow
- Hybrid Supabase + Next-Auth system
- Guest user support
- Session management through middleware
- Protected routes with automatic redirects

### Key Features
- **Chat Interface**: Multi-model AI chat with reasoning support
- **Artifacts**: Code, text, image, and spreadsheet generation
- **Document Editing**: Collaborative document editing with suggestions
- **Web Scraping**: Firecrawl integration for web content extraction
- **File Upload**: Document and image upload capabilities
- **Responsive Design**: Mobile-friendly interface with sidebar navigation

## Important Notes
- Uses experimental React 19 RC
- Biome configuration disables certain a11y rules for intentional design choices
- Test environment uses mock AI models (`lib/ai/models.test.ts`)
- Database migrations are in `lib/db/migrations/`
- Environment variables required for AI providers and Supabase