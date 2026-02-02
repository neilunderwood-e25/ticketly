#!/bin/bash

set -e

PROJECT_REF="vmpgltldregpdxazaftd"
ACCESS_TOKEN="sbp_1843424473781df8554351924026b3f8db3f2cff"
API_URL="https://api.supabase.com/v1/projects/$PROJECT_REF/database/query"

echo "Applying Supabase migrations..."

# Function to execute SQL
execute_sql() {
    local sql="$1"
    local description="$2"

    echo "Executing: $description"

    # Escape the SQL for JSON
    local json_sql=$(jq -n --arg sql "$sql" '{"query": $sql}')

    response=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_sql")

    if echo "$response" | grep -q "error"; then
        echo "Error: $response"
        return 1
    fi

    echo "✓ Success"
    echo ""
}

# Migration 1: Create events table
execute_sql "CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_datetime_range CHECK (end_datetime > start_datetime)
);" "Create events table"

# Create indexes
execute_sql "CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);" "Create index on created_by"
execute_sql "CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);" "Create index on start_datetime"
execute_sql "CREATE INDEX IF NOT EXISTS idx_events_visibility ON public.events(visibility);" "Create index on visibility"
execute_sql "CREATE INDEX IF NOT EXISTS idx_events_created_by_start_datetime ON public.events(created_by, start_datetime DESC);" "Create composite index"

# Enable RLS
execute_sql "ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;" "Enable RLS"

# Drop existing policies if they exist
execute_sql "DROP POLICY IF EXISTS \"Users can view own events\" ON public.events;" "Drop old policy"
execute_sql "DROP POLICY IF EXISTS \"Anyone can view public events\" ON public.events;" "Drop old policy"
execute_sql "DROP POLICY IF EXISTS \"Users can create own events\" ON public.events;" "Drop old policy"
execute_sql "DROP POLICY IF EXISTS \"Users can update own events\" ON public.events;" "Drop old policy"
execute_sql "DROP POLICY IF EXISTS \"Users can delete own events\" ON public.events;" "Drop old policy"

# Create RLS policies
execute_sql "CREATE POLICY \"Users can view own events\" ON public.events FOR SELECT USING (created_by = auth.jwt() ->> 'sub');" "Create view own policy"
execute_sql "CREATE POLICY \"Anyone can view public events\" ON public.events FOR SELECT USING (visibility = 'public');" "Create view public policy"
execute_sql "CREATE POLICY \"Users can create own events\" ON public.events FOR INSERT WITH CHECK (created_by = auth.jwt() ->> 'sub');" "Create insert policy"
execute_sql "CREATE POLICY \"Users can update own events\" ON public.events FOR UPDATE USING (created_by = auth.jwt() ->> 'sub') WITH CHECK (created_by = auth.jwt() ->> 'sub');" "Create update policy"
execute_sql "CREATE POLICY \"Users can delete own events\" ON public.events FOR DELETE USING (created_by = auth.jwt() ->> 'sub');" "Create delete policy"

# Create function and trigger
execute_sql "CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS \$\$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; \$\$ LANGUAGE plpgsql;" "Create update function"
execute_sql "DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;" "Drop old trigger"
execute_sql "CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();" "Create update trigger"

# Grant permissions
execute_sql "GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;" "Grant authenticated permissions"
execute_sql "GRANT SELECT ON public.events TO anon;" "Grant anon permissions"

# Migration 2: Create storage bucket
execute_sql "INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true) ON CONFLICT (id) DO NOTHING;" "Create storage bucket"

# Drop existing storage policies
execute_sql "DROP POLICY IF EXISTS \"Authenticated users can upload event images\" ON storage.objects;" "Drop old storage policy"
execute_sql "DROP POLICY IF EXISTS \"Public access to event images\" ON storage.objects;" "Drop old storage policy"
execute_sql "DROP POLICY IF EXISTS \"Users can update own event images\" ON storage.objects;" "Drop old storage policy"
execute_sql "DROP POLICY IF EXISTS \"Users can delete own event images\" ON storage.objects;" "Drop old storage policy"

# Create storage policies
execute_sql "CREATE POLICY \"Authenticated users can upload event images\" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);" "Create upload policy"
execute_sql "CREATE POLICY \"Public access to event images\" ON storage.objects FOR SELECT TO public USING (bucket_id = 'events');" "Create public view policy"
execute_sql "CREATE POLICY \"Users can update own event images\" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]) WITH CHECK (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);" "Create update image policy"
execute_sql "CREATE POLICY \"Users can delete own event images\" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);" "Create delete image policy"

echo "All migrations completed successfully!"
