-- Create enum type for report status
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- Create reports table
CREATE TABLE public.reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid REFERENCES public.profiles(id) NOT NULL,
    reported_user_id uuid REFERENCES public.profiles(id),
    listing_id uuid REFERENCES public.listings(id),
    message_id uuid REFERENCES public.messages(id),
    reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 1000),
    status report_status NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone,

    -- Ensure at least one report target is specified
    CONSTRAINT valid_report_target CHECK (
        (CASE WHEN reported_user_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN listing_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN message_id IS NOT NULL THEN 1 ELSE 0 END) >= 1
    ),
    
    -- Prevent self-reporting
    CONSTRAINT no_self_reports CHECK (reporter_id != reported_user_id)
);

-- Create indexes
CREATE INDEX reports_reporter_id_idx ON public.reports(reporter_id);
CREATE INDEX reports_reported_user_id_idx ON public.reports(reported_user_id);
CREATE INDEX reports_listing_id_idx ON public.reports(listing_id);
CREATE INDEX reports_message_id_idx ON public.reports(message_id);
CREATE INDEX reports_status_idx ON public.reports(status);
CREATE INDEX reports_created_at_idx ON public.reports(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT
    USING (
        auth.uid() = reporter_id OR 
        auth.uid() = reported_user_id
    );

CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins have full access to reports"
    ON public.reports FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Helper function to get user's total reports
CREATE OR REPLACE FUNCTION public.get_user_reports_count(user_id_param uuid)
RETURNS TABLE (
    total_reports bigint,
    pending_reports bigint,
    resolved_reports bigint,
    dismissed_reports bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
        COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_reports
    FROM reports
    WHERE reported_user_id = user_id_param;
$$;

-- Function to check if user can be reported
CREATE OR REPLACE FUNCTION public.can_report_user(
    reporter_id_param uuid,
    reported_user_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if there's an existing pending report
    IF EXISTS (
        SELECT 1
        FROM reports
        WHERE reporter_id = reporter_id_param
        AND reported_user_id = reported_user_id_param
        AND status = 'pending'
    ) THEN
        RETURN false;
    END IF;

    -- Prevent reporting admins
    IF EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.id = reported_user_id_param
        AND r.name = 'admin'
    ) THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Function to check if listing can be reported
CREATE OR REPLACE FUNCTION public.can_report_listing(
    reporter_id_param uuid,
    listing_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if there's an existing pending report
    IF EXISTS (
        SELECT 1
        FROM reports
        WHERE reporter_id = reporter_id_param
        AND listing_id = listing_id_param
        AND status = 'pending'
    ) THEN
        RETURN false;
    END IF;

    -- Check if listing exists and is active
    IF NOT EXISTS (
        SELECT 1
        FROM listings
        WHERE id = listing_id_param
        AND is_active = true
    ) THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Function to check if message can be reported
CREATE OR REPLACE FUNCTION public.can_report_message(
    reporter_id_param uuid,
    message_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if there's an existing pending report
    IF EXISTS (
        SELECT 1
        FROM reports
        WHERE reporter_id = reporter_id_param
        AND message_id = message_id_param
        AND status = 'pending'
    ) THEN
        RETURN false;
    END IF;

    -- Check if reporter is part of the conversation
    IF NOT EXISTS (
        SELECT 1
        FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE m.id = message_id_param
        AND (c.buyer_id = reporter_id_param OR c.seller_id = reporter_id_param)
    ) THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Function to resolve a report
CREATE OR REPLACE FUNCTION public.resolve_report(
    report_id_param uuid,
    status_param report_status,
    admin_notes_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE reports
    SET 
        status = status_param,
        admin_notes = COALESCE(admin_notes_param, admin_notes),
        resolved_at = CASE 
            WHEN status_param IN ('resolved', 'dismissed') THEN now()
            ELSE NULL
        END
    WHERE id = report_id_param;
END;
$$;