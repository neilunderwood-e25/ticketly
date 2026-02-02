# Ticketly Setup Guide

## Database Setup

This application uses Supabase for database and storage. Follow these steps to set up your database:

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

You'll need to add:
- Clerk credentials from https://dashboard.clerk.com
- Supabase credentials from https://app.supabase.com/project/_/settings/api

### 2. Run Migrations

To apply the database migrations, you have two options:

#### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/20260201000001_create_events_table.sql`
   - `supabase/migrations/20260201000002_create_storage_bucket.sql`
4. Execute each SQL file

#### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Configure Clerk Authentication with Supabase

For Row Level Security to work properly, you need to configure Clerk to work with Supabase:

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Enable **JWT** as a provider
3. Copy the JWT Secret
4. In Clerk dashboard, go to **JWT Templates**
5. Create a new template called "supabase"
6. Add this claim:
   ```json
   {
     "sub": "{{user.id}}"
   }
   ```

### 4. Database Schema

The migrations create the following:

#### Events Table
- `id` (UUID) - Primary key
- `name` (TEXT) - Event name
- `description` (TEXT) - Event description
- `image_url` (TEXT) - URL to event image
- `visibility` (TEXT) - 'public' or 'private'
- `start_datetime` (TIMESTAMPTZ) - Event start time
- `end_datetime` (TIMESTAMPTZ) - Event end time
- `timezone` (TEXT) - Timezone identifier
- `created_by` (TEXT) - Clerk user ID
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

#### Storage Bucket
- **events** bucket for storing event images
- Public read access
- Authenticated users can upload to their own folders

### 5. Row Level Security Policies

The following RLS policies are automatically created:

- Users can view their own events
- Anyone can view public events
- Users can only create, update, and delete their own events
- Users can only upload images to their own folders

## Development

Once setup is complete, run the development server:

```bash
npm run dev
```

Visit http://localhost:3000/create to create your first event.
