-- Create enum type for notification types
CREATE TYPE notification_type AS ENUM (
    'message',
    'review',
    'like',
    'verification',
    'listing',
    'report'
);

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    type notification_type NOT NULL,
    reference_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_type_idx ON public.notifications(type);
CREATE INDEX notifications_reference_id_idx ON public.notifications(reference_id);
CREATE INDEX notifications_is_read_idx ON public.notifications(is_read) WHERE NOT is_read;
CREATE INDEX notifications_created_at_idx ON public.notifications(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);