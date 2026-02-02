-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic event information
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    -- Event visibility
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),

    -- Event timing
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL,

    -- User ownership (Clerk user ID)
    created_by TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_datetime_range CHECK (end_datetime > start_datetime)
);

-- Create index on created_by for faster queries
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- Create index on start_datetime for event listing queries
CREATE INDEX idx_events_start_datetime ON public.events(start_datetime);

-- Create index on visibility for filtering public events
CREATE INDEX idx_events_visibility ON public.events(visibility);

-- Create composite index for user's events
CREATE INDEX idx_events_created_by_start_datetime ON public.events(created_by, start_datetime DESC);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own events
CREATE POLICY "Users can view own events"
ON public.events
FOR SELECT
USING (created_by = auth.jwt() ->> 'sub');

-- Policy: Users can view public events
CREATE POLICY "Anyone can view public events"
ON public.events
FOR SELECT
USING (visibility = 'public');

-- Policy: Users can insert their own events
CREATE POLICY "Users can create own events"
ON public.events
FOR INSERT
WITH CHECK (created_by = auth.jwt() ->> 'sub');

-- Policy: Users can update their own events
CREATE POLICY "Users can update own events"
ON public.events
FOR UPDATE
USING (created_by = auth.jwt() ->> 'sub')
WITH CHECK (created_by = auth.jwt() ->> 'sub');

-- Policy: Users can delete their own events
CREATE POLICY "Users can delete own events"
ON public.events
FOR DELETE
USING (created_by = auth.jwt() ->> 'sub');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
