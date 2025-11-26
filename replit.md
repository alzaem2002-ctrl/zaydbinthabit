# School Performance Documentation System

## Overview

A comprehensive web-based system for documenting and managing professional performance indicators and evidence for teachers and supervisors in educational institutions. The application is specifically designed for Arabic-speaking schools with full RTL (right-to-left) support and focuses on tracking professional capabilities, indicators, criteria, and supporting evidence/witnesses.

The system serves multiple roles (administrators, supervisors, and teachers) and provides features for managing professional development indicators, tracking progress, selecting teaching strategies, and generating performance reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component Library:**
- Shadcn/ui components (New York variant) built on Radix UI primitives
- Full RTL layout support for Arabic interface
- Tailwind CSS for styling with custom design system
- Theme provider supporting light/dark modes

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form handling
- Context API for theme and authentication state

**Design System:**
- Material Design adapted for Arabic RTL educational administration
- Custom color palette optimized for professional educational context
- Typography using Cairo and Tajawal font families for Arabic
- Responsive grid layouts: 2-column desktop (300px sidebar + flexible main), adaptive mobile

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Two server configurations:
  - Development: Hot module replacement with Vite integration
  - Production: Optimized static file serving

**Database Layer:**
- Drizzle ORM for type-safe database operations
- PostgreSQL via Neon serverless database
- Connection pooling using @neondatabase/serverless

**Session Management:**
- Express sessions with PostgreSQL session store (connect-pg-simple)
- Secure cookie configuration with 7-day TTL

**API Structure:**
- RESTful endpoints under `/api` prefix
- Authentication-protected routes using middleware
- JSON request/response format
- Error handling with appropriate HTTP status codes

### Authentication & Authorization

**Replit Authentication Integration:**
- OpenID Connect (OIDC) flow via Passport.js
- Strategy pattern for extensible authentication
- Token-based session management with refresh capabilities
- Role-based access control (admin, supervisor, teacher)

**Security Features:**
- HTTP-only secure cookies
- Session expiration and refresh token handling
- Authentication middleware for protected routes

### Database Schema

**Core Tables:**

1. **sessions** - Session storage for authentication
2. **users** - User profiles with roles and school information
3. **indicators** - Professional performance indicators
4. **criteria** - Success criteria for each indicator
5. **witnesses** - Evidence/documentation supporting indicators
6. **strategies** - Teaching strategies catalog
7. **userStrategies** - User-selected strategies (many-to-many)
8. **capabilities** - Professional capabilities taxonomy
9. **changes** - Audit trail for system changes

**Relationships:**
- One-to-many: users → indicators, indicators → criteria
- Many-to-many: users ↔ strategies (via userStrategies)
- Cascade deletion for maintaining referential integrity

**Data Validation:**
- Drizzle-Zod integration for runtime schema validation
- TypeScript types generated from database schema
- Shared schema between client and server (`@shared/schema`)

### Key Features

**Dashboard & Statistics:**
- Real-time stats aggregation (total capabilities, indicators, witnesses, completed items)
- Progress tracking with visual indicators
- Role-specific data filtering

**Indicator Management:**
- CRUD operations for professional indicators
- Status tracking (pending, in_progress, completed)
- Criteria-based evaluation system
- Witness/evidence attachment

**Strategy Selection:**
- Pre-defined teaching strategies catalog
- User-customizable strategy selection
- Strategy-indicator associations

**Data Operations:**
- Export/import functionality for data portability
- Print-ready report generation
- Re-evaluation workflows

### Third-Party Integrations

**Authentication:**
- Replit Identity Provider (OIDC)
- Issuer URL: process.env.ISSUER_URL (defaults to https://replit.com/oidc)

**Database:**
- Neon Serverless PostgreSQL
- Connection via DATABASE_URL environment variable
- WebSocket support for serverless compatibility

**Development Tools:**
- Replit-specific Vite plugins (cartographer, dev-banner, runtime-error-modal)
- Source map support for debugging

### File Organization

**Monorepo Structure:**
- `/client` - React frontend application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas
- `/migrations` - Database migration files
- `/attached_assets` - Static design references

**Module Resolution:**
- Path aliases configured via TypeScript and Vite:
  - `@/*` → client source files
  - `@shared/*` → shared schemas
  - `@assets/*` → attached assets

### Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit deployment identifier
- `ISSUER_URL` - OIDC issuer endpoint (optional, defaults to Replit)
- `NODE_ENV` - Environment mode (development/production)

### Performance Optimizations

- Query result memoization for OIDC configuration
- Infinite stale time for React Query to reduce unnecessary refetches
- Static asset caching in production
- Lazy loading of development-only Vite plugins
- Connection pooling for database queries

### Localization

- Primary language: Arabic (ar)
- RTL direction throughout the application
- Arabic-optimized font stack
- Date formatting using date-fns library