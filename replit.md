# VisaFlow - Immigration Document Management System

## Overview

VisaFlow is a mobile-first web application designed to help users manage immigration documents and visa applications. The application provides features like document checklists, AI-powered form assistance, real-time application tracking, and expert support for Canadian immigration processes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom theming (Canadian red and professional blue colors)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Mobile-First Design**: Optimized for mobile devices with responsive design

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: PostgreSQL-based sessions (connect-pg-simple)
- **API Design**: RESTful API with `/api` prefix

### Data Storage
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations in `/migrations` directory
- **Fallback Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
- **Users Table**: Basic user management with username/password authentication
- **Schema Validation**: Zod schemas for type-safe data validation
- **Type Generation**: Automatic TypeScript type generation from database schema

### UI Components
- **Component Library**: Comprehensive set of shadcn/ui components
- **Theme System**: CSS variables-based theming with light/dark mode support
- **Form Handling**: React Hook Form with Zod resolvers for validation
- **Toast Notifications**: Radix UI toast system for user feedback

### Page Structure
- **Landing Page**: Mobile-optimized landing page with feature highlights
- **Upload Page**: Document upload interface with drag-and-drop functionality
- **404 Page**: Error handling for undefined routes

### Storage Interface
- **Abstraction Layer**: `IStorage` interface for database operations
- **Implementation**: Both in-memory and database-backed storage options
- **CRUD Operations**: Standard create, read, update, delete operations for users

## Data Flow

### Client-Server Communication
1. **API Requests**: Fetch-based HTTP client with automatic error handling
2. **Authentication**: Cookie-based session management
3. **Data Fetching**: React Query for caching and synchronization
4. **Form Submission**: Validated form data sent to Express API endpoints

### Database Operations
1. **Schema Definition**: Shared TypeScript schema definitions
2. **Query Building**: Drizzle ORM query builder for type-safe database operations
3. **Migration Management**: Drizzle Kit for schema changes and migrations
4. **Connection Management**: Neon Database serverless connection handling

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Database**: Drizzle ORM, Neon Database driver
- **Server**: Express.js, Node.js
- **Build Tools**: Vite, TypeScript, ESBuild

### Development Tools
- **Replit Integration**: Custom plugins for Replit development environment
- **Hot Reload**: Vite HMR for development
- **Error Overlay**: Runtime error modal for debugging
- **Code Mapping**: Source map support for debugging

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `/dist/public`
2. **Backend Build**: ESBuild bundles Express server to `/dist/index.js`
3. **Static Assets**: Frontend assets served from `/dist/public`

### Production Configuration
- **Environment Variables**: `DATABASE_URL` for database connection
- **Server Mode**: Production Express server serves both API and static files
- **Database**: PostgreSQL database with Drizzle ORM
- **Session Storage**: PostgreSQL-based session storage

### Development Environment
- **Hot Reload**: Vite dev server with Express API proxy
- **Database**: Can use either PostgreSQL or in-memory storage
- **Error Handling**: Development-specific error overlays and logging
- **Replit Integration**: Special handling for Replit development environment

### Key Architectural Decisions

1. **Mobile-First Design**: Chosen to prioritize mobile user experience for immigration document management
2. **Shared Schema**: TypeScript schema shared between client and server for type safety
3. **Modular Storage**: Abstract storage interface allows for different storage backends
4. **Component-Based UI**: Radix UI + shadcn/ui for consistent, accessible components
5. **Session-Based Auth**: Cookie-based sessions for stateful authentication
6. **PostgreSQL Choice**: Reliable, feature-rich database for production use with Neon serverless hosting