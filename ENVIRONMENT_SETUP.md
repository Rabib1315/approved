# Environment Setup for VisaNavigator

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase (Database + Storage)
```bash
# Database connection for Drizzle ORM
DATABASE_URL="postgresql://postgres.eqzlokmidnigdlotnkjw:dABP5cvdhJfqB2L2@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Supabase project settings
NEXT_PUBLIC_SUPABASE_URL="https://eqzlokmidnigdlotnkjw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxemxva21pZG5pZ2Rsb3Rua2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDUwMzEsImV4cCI6MjA2Nzc4MTAzMX0.gyBP2QkIXIhh24tv23EX2ClVPsq6luvI70AlYgmZ57s"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxemxva21pZG5pZ2Rsb3Rua2p3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIwNTAzMSwiZXhwIjoyMDY3NzgxMDMxfQ.OICpAcMF-_AJAkK1bAdlPqu-9yVoG7x1-8ZThesiudk"
```

### Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"
```

## Setup Instructions

1. **Supabase Setup (Database + Storage)**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > Database to find your connection string
   - Copy the connection string and replace `[YOUR-PASSWORD]` with your database password
   - Go to Settings > API to copy your project URL and anon key
   - Create a storage bucket named "documents" in Storage
   - Set up RLS policies for secure access to the storage bucket
   - Enable Row Level Security (RLS) on your tables
   - Run `npm run db:generate` to create migrations
   - Run `npm run db:migrate` to apply migrations

2. **Clerk Setup**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your publishable and secret keys
   - Configure sign-in methods (email, social, etc.)

## Database Commands

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio
npm run db:studio

# Push schema changes directly (development only)
npm run db:push
``` 