-- ASWAQ Marketplace Database Schema with Arabic Support
-- Complete Schema Document

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =======================================================
-- SECTION 1: PROFILES AND USER MANAGEMENT
-- =======================================================

-- Create roles table
CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE CHECK (name IN ('admin', 'user')),
    name_ar text,
    description text,
    description_ar text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users PRIMARY KEY,
    full_name text NOT NULL,
    avatar_url text,
    date_of_birth date,
    phone_number text UNIQUE,
    verification_status text CHECK (verification_status IN ('unverified', 'pending', 'verified')) DEFAULT 'unverified',
    is_banned boolean DEFAULT false,
    join_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    preferred_language text NOT NULL DEFAULT 'en',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_language CHECK (preferred_language IN ('en', 'ar'))
);

-- Create user_roles junction table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY REFERENCES public.profiles,
    role_id uuid REFERENCES public.roles NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(id, role_id)
);

-- Create verification requests table
CREATE TABLE public.verification_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    document_type text CHECK (document_type IN ('id', 'passport')) NOT NULL,
    document_urls text[] NOT NULL,
    document_number text NOT NULL,
    document_expiry date NOT NULL,
    verification_status text CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes text,
    rejection_reason text,
    verified_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at timestamp with time zone
);

-- Create updated_at function and trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        phone_number,
        avatar_url,
        preferred_language
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    );

    -- Assign default 'personal' role
    INSERT INTO public.user_roles (id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'personal';

    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.id = user_id
        AND r.name = 'admin'
    );
$$;

-- Add deleted_at column to profiles table
ALTER TABLE public.profiles
ADD COLUMN deleted_at timestamp with time zone;

-- Create index to improve query performance for finding deleted accounts
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Function to handle account reactivation (when user logs back in during the 30-day grace period)
CREATE OR REPLACE FUNCTION public.handle_account_reactivation()
RETURNS TRIGGER AS
$BODY$
BEGIN
    -- If the last_sign_in_at field has been updated, reactivate the account if it was marked for deletion
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
        -- Check if the user's profile is marked for deletion
        UPDATE public.profiles
        SET deleted_at = NULL
        WHERE id = NEW.id AND deleted_at IS NOT NULL;
    END IF;
    
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Create trigger to automatically reactivate accounts when user logs in (detected by last_sign_in_at change)
DROP TRIGGER IF EXISTS on_user_login_reactivate ON auth.users;
CREATE TRIGGER on_user_login_reactivate
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_account_reactivation();

-- Create function to permanently delete accounts after 30 days
CREATE OR REPLACE FUNCTION public.permanently_delete_inactive_accounts()
RETURNS void AS
$BODY$
DECLARE
    user_id uuid;
BEGIN
    -- Find accounts that have been marked for deletion for more than 30 days
    FOR user_id IN
        SELECT id FROM public.profiles
        WHERE deleted_at IS NOT NULL
        AND deleted_at < (NOW() - INTERVAL '30 days')
    LOOP
        -- Delete the user from auth.users (this will cascade to profiles due to foreign key)
        DELETE FROM auth.users WHERE id = user_id;
    END LOOP;
END;
$BODY$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- First, enable the pg_cron extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at midnight
SELECT cron.schedule('0 0 * * *', $$SELECT permanently_delete_inactive_accounts()$$);

-- Arabic language functions
CREATE OR REPLACE FUNCTION public.get_user_language(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT preferred_language FROM public.profiles WHERE id = user_id),
        'en'  -- Default to English if not set
    );
$$;

CREATE OR REPLACE FUNCTION public.set_user_language(
    language_code text DEFAULT 'en'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate language code
    IF language_code NOT IN ('en', 'ar') THEN
        RAISE EXCEPTION 'Invalid language code. Supported languages: en, ar';
    END IF;

    -- Update user's profile
    UPDATE public.profiles
    SET preferred_language = language_code
    WHERE id = auth.uid();

    -- Update user's metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{preferred_language}',
        to_jsonb(language_code)
    )
    WHERE id = auth.uid();
END;
$$;

-- Function to sync language preference
CREATE OR REPLACE FUNCTION public.sync_language_preference()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.preferred_language != NEW.preferred_language THEN
        -- Update user's metadata when profile language changes
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{preferred_language}',
            to_jsonb(NEW.preferred_language)
        )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER sync_language_preference_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (OLD.preferred_language IS DISTINCT FROM NEW.preferred_language)
EXECUTE FUNCTION public.sync_language_preference();

-- Function for localized content
CREATE OR REPLACE FUNCTION public.get_localized_content(
    content_en text,
    content_ar text,
    user_id uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_lang text;
BEGIN
    -- If user_id is provided, get user's language preference
    IF user_id IS NOT NULL THEN
        user_lang := public.get_user_language(user_id);
    ELSE
        -- Default to the current setting or English
        user_lang := COALESCE(current_setting('app.locale', true), 'en');
    END IF;

    -- Return content based on language
    IF user_lang = 'ar' AND content_ar IS NOT NULL THEN
        RETURN content_ar;
    ELSE
        RETURN content_en;
    END IF;
END;
$$;

-- Set up Row Level Security (RLS) for user tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Roles are viewable by admin only"
    ON public.roles FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Roles are insertable by admin only"
    ON public.roles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Roles are updatable by admin only"
    ON public.roles FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Roles are deletable by admin only"
    ON public.roles FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "User roles are viewable by admin only"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "User roles are insertable by admin only"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "User roles are updatable by admin only"
    ON public.user_roles FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "User roles are deletable by admin only"
    ON public.user_roles FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Verification requests policies
CREATE POLICY "Users can view their own verification requests"
    ON public.verification_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification requests"
    ON public.verification_requests FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to verification requests"
    ON public.verification_requests FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Insert default roles with different listing limits
INSERT INTO public.roles (name, name_ar, description, description_ar)
VALUES
    ('admin', 'مسؤول', 'Administrator with full system access', 'مسؤول مع وصول كامل للنظام'),
    ('user', 'مستخدم', 'Regular user account', 'حساب مستخدم عادي')
ON CONFLICT (name) DO UPDATE
SET
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar;

-- =======================================================
-- SECTION 2: CONTENT MANAGEMENT (PAGES, FAQ, HELP)
-- =======================================================

-- Create pages table with MDX content
CREATE TABLE public.pages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    title_ar text,
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
    content text NOT NULL CHECK (
        content != '' AND  -- Not empty
        content ~ '[\s\S]*'  -- Allow multiline content
    ),
    content_ar text,
    meta_description text,
    meta_description_ar text,
    meta_keywords text,
    meta_keywords_ar text,
    is_published boolean NOT NULL DEFAULT false,
    last_updated_by uuid REFERENCES public.profiles(id),
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create FAQ categories table
CREATE TABLE public.faq_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    name_ar text,
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
    description text,
    description_ar text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name)
);

-- Create FAQ articles table
CREATE TABLE public.faq_articles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    title text NOT NULL,
    title_ar text,
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
    content text NOT NULL CHECK (
        content != '' AND  -- Not empty
        content ~ '[\s\S]*'  -- Allow multiline content with MDX syntax
    ),
    content_ar text,
    frontmatter jsonb DEFAULT '{}'::jsonb,  -- Store MDX frontmatter metadata
    tags text[] DEFAULT array[]::text[],
    view_count integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    last_updated_by uuid REFERENCES public.profiles(id),
    version integer NOT NULL DEFAULT 1,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for content tables
CREATE INDEX pages_slug_idx ON public.pages(slug);
CREATE INDEX pages_publication_idx ON public.pages(is_published);

CREATE INDEX faq_categories_slug_idx ON public.faq_categories(slug);
CREATE INDEX faq_categories_display_order_idx ON public.faq_categories(display_order);
CREATE INDEX faq_articles_category_id_idx ON public.faq_articles(category_id);
CREATE INDEX faq_articles_slug_idx ON public.faq_articles(slug);
CREATE INDEX faq_articles_display_order_idx ON public.faq_articles(display_order);
CREATE INDEX faq_articles_tags_idx ON public.faq_articles USING gin(tags);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.faq_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.faq_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Set up Row Level Security (RLS) for content tables
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;

-- Policies for viewing pages
CREATE POLICY "Pages are viewable by everyone when published"
    ON public.pages FOR SELECT
    USING (is_published = true);

-- Policies for admins
CREATE POLICY "Admins have full access to pages"
    ON public.pages FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Policies for viewing FAQs (public access)
CREATE POLICY "FAQ categories are viewable by everyone"
    ON public.faq_categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "FAQ articles are viewable by everyone when published"
    ON public.faq_articles FOR SELECT
    USING (is_published = true);

-- Policies for admin access
CREATE POLICY "Admins have full access to FAQ categories"
    ON public.faq_categories FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins have full access to FAQ articles"
    ON public.faq_articles FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Helper functions for content
CREATE OR REPLACE FUNCTION public.get_active_page(slug_param text)
RETURNS TABLE (
    id uuid,
    title text,
    title_ar text,
    slug text,
    content text,
    content_ar text,
    meta_description text,
    meta_description_ar text,
    published_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.title,
        p.title_ar,
        p.slug,
        p.content,
        p.content_ar,
        p.meta_description,
        p.meta_description_ar,
        p.published_at
    FROM public.pages p
    WHERE p.slug = slug_param
    AND p.is_published = true
    LIMIT 1;
$$;

-- Helper function to get all FAQs by category
CREATE OR REPLACE FUNCTION public.get_faqs_by_category(category_slug text, lang text DEFAULT 'en')
RETURNS TABLE (
    category_name text,
    category_description text,
    articles json
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    -- First check if the category exists
    WITH category AS (
        SELECT 
            fc.id,
            CASE WHEN lang = 'ar' AND fc.name_ar IS NOT NULL THEN fc.name_ar ELSE fc.name END as category_name,
            CASE WHEN lang = 'ar' AND fc.description_ar IS NOT NULL THEN fc.description_ar ELSE fc.description END as category_description
        FROM faq_categories fc
        WHERE fc.slug = category_slug
        AND fc.is_active = true
        LIMIT 1
    )
    
    SELECT 
        c.category_name,
        c.category_description,
        COALESCE(
            (SELECT 
                json_agg(
                    json_build_object(
                        'id', fa.id,
                        'title', CASE WHEN lang = 'ar' AND fa.title_ar IS NOT NULL THEN fa.title_ar ELSE fa.title END,
                        'content', CASE WHEN lang = 'ar' AND fa.content_ar IS NOT NULL THEN fa.content_ar ELSE fa.content END,
                        'slug', fa.slug,
                        'frontmatter', fa.frontmatter,
                        'tags', fa.tags,
                        'view_count', fa.view_count,
                        'updated_at', fa.updated_at
                    )
                )
            FROM faq_articles fa
            WHERE fa.category_id = c.id
            AND fa.is_published = true
            ),
            '[]'::json
        ) as articles
    FROM category c;
$$;

-- Helper function to get FAQ article with frontmatter
CREATE OR REPLACE FUNCTION public.get_faq_article(article_slug text, lang text DEFAULT 'en')
RETURNS TABLE (
    title text,
    content text,
    frontmatter jsonb,
    category_name text,
    category_slug text,
    updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        CASE WHEN lang = 'ar' AND fa.title_ar IS NOT NULL THEN fa.title_ar ELSE fa.title END as title,
        CASE WHEN lang = 'ar' AND fa.content_ar IS NOT NULL THEN fa.content_ar ELSE fa.content END as content,
        fa.frontmatter,
        CASE WHEN lang = 'ar' AND fc.name_ar IS NOT NULL THEN fc.name_ar ELSE fc.name END as category_name,
        fc.slug as category_slug,
        fa.updated_at
    FROM faq_articles fa
    JOIN faq_categories fc ON fa.category_id = fc.id
    WHERE fa.slug = article_slug
    AND fc.is_active = true
    AND fa.is_published = true
    LIMIT 1;
$$;

-- Insert the main FAQ categories
INSERT INTO public.faq_categories (name, name_ar, slug, description, description_ar, display_order) VALUES
    ('Accounts', 'الحسابات', 'accounts', 'Account management, updates, security & login/registration', 'إدارة الحساب، التحديثات، الأمان وتسجيل الدخول/التسجيل', 1),
    ('Listing services', 'خدمات القوائم', 'listing-services', 'Creating, managing & boosting listings including pricing rules & limits', 'إنشاء وإدارة وتعزيز القوائم بما في ذلك قواعد التسعير والحدود', 2),
    ('Payments & Purchases', 'المدفوعات والمشتريات', 'payments-purchases', 'Transactions, payments, credits & vouchers', 'المعاملات، المدفوعات، الرصيد والقسائم', 3),
    ('Advertising', 'الإعلانات', 'advertising', 'Sliders, Banner & other services', 'الشرائح، الإعلانات والخدمات الأخرى', 4),
    ('New paid listing model', 'نموذج القوائم المدفوعة الجديد', 'paid-listing', 'Features, benefits, paid listing visibility & more', 'الميزات، الفوائد، رؤية القوائم المدفوعة والمزيد', 5),
    ('Safety & Security', 'السلامة والأمان', 'safety-security', 'Transactions & account protection, avoid scams, reporting issues', 'حماية المعاملات والحسابات، تجنب الاحتيال، الإبلاغ عن المشكلات', 6)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar,
    display_order = EXCLUDED.display_order;

-- =======================================================
-- SECTION 3: CATEGORIES AND LOCATIONS
-- =======================================================

-- Create categories table
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid REFERENCES public.categories(id),
    name text NOT NULL,
    name_ar text,
    slug text NOT NULL,
    description text,
    description_ar text,
    icon text,
    display_in_header boolean NOT NULL DEFAULT false,
    display_in_hero boolean NOT NULL DEFAULT false,
    display_in_home boolean NOT NULL DEFAULT false,
    hero_image text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    CONSTRAINT categories_name_unique UNIQUE (name),
    CONSTRAINT categories_slug_unique UNIQUE (slug),
    CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT categories_no_self_parent CHECK (id != parent_id)
);

-- Create locations table
CREATE TABLE public.locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid REFERENCES public.locations(id),
    name text NOT NULL,
    name_ar text NOT NULL,
    slug text NOT NULL,
    type text CHECK (type IN ('country', 'city')) NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    CONSTRAINT locations_name_type_unique UNIQUE (name, type),
    CONSTRAINT locations_name_ar_type_unique UNIQUE (name_ar, type),
    CONSTRAINT locations_slug_unique UNIQUE (slug),
    CONSTRAINT locations_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT locations_no_self_parent CHECK (id != parent_id),
    CONSTRAINT locations_hierarchy_check CHECK (
        (type = 'country' AND parent_id IS NULL) OR
        (type = 'city' AND parent_id IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX categories_parent_id_idx ON public.categories(parent_id);
CREATE INDEX categories_slug_idx ON public.categories(slug);
CREATE INDEX categories_display_order_idx ON public.categories(display_order);

CREATE INDEX locations_parent_id_idx ON public.locations(parent_id);
CREATE INDEX locations_slug_idx ON public.locations(slug);
CREATE INDEX locations_type_idx ON public.locations(type);
CREATE INDEX locations_coordinates_idx ON public.locations(latitude, longitude);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Set up Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Policies for locations
CREATE POLICY "Locations are viewable by everyone"
    ON public.locations FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage locations"
    ON public.locations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Helper functions for categories
CREATE OR REPLACE FUNCTION public.get_category_path(category_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    name_ar text,
    slug text,
    level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY WITH RECURSIVE category_path AS (
        -- Base case: start with the target category
        SELECT
            c.id,
            c.name,
            c.name_ar,
            c.slug,
            1 as level
        FROM categories c
        WHERE c.id = category_id

        UNION ALL

        -- Recursive case: join with parent categories
        SELECT
            c.id,
            c.name,
            c.name_ar,
            c.slug,
            cp.level + 1
        FROM categories c
        INNER JOIN category_path cp ON c.parent_id = cp.id
    )
    SELECT * FROM category_path
    ORDER BY level DESC;
END;
$$;

-- Function to get all subcategories of a category
CREATE OR REPLACE FUNCTION public.get_subcategories(parent_category_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    name_ar text,
    slug text,
    level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY WITH RECURSIVE subcategories AS (
        -- Base case: direct children
        SELECT
            c.id,
            c.name,
            c.name_ar,
            c.slug,
            1 as level
        FROM categories c
        WHERE c.parent_id = parent_category_id
        AND c.is_active = true

        UNION ALL

        -- Recursive case: children of children
        SELECT
            c.id,
            c.name,
            c.name_ar,
            c.slug,
            s.level + 1
        FROM categories c
        INNER JOIN subcategories s ON c.parent_id = s.id
        WHERE c.is_active = true
    )
    SELECT * FROM subcategories
    ORDER BY level, name;
END;
$$;

-- Helper functions for locations
CREATE OR REPLACE FUNCTION public.get_city_with_country(city_id_param uuid, lang text DEFAULT 'en')
RETURNS TABLE (
    city_id uuid,
    city_name text,
    city_slug text,
    country_id uuid,
    country_name text,
    country_slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id as city_id,
        CASE WHEN lang = 'ar' THEN c.name_ar ELSE c.name END as city_name,
        c.slug as city_slug,
        co.id as country_id,
        CASE WHEN lang = 'ar' THEN co.name_ar ELSE co.name END as country_name,
        co.slug as country_slug
    FROM locations c
    JOIN locations co ON c.parent_id = co.id
    WHERE c.id = city_id_param
    AND c.type = 'city'
    AND co.type = 'country';
END;
$$;
-- Function to get cities in country
CREATE OR REPLACE FUNCTION public.get_cities_in_country(country_id uuid, lang text DEFAULT 'en')
RETURNS TABLE (
    id uuid,
    name text,
    slug text,
    latitude numeric,
    longitude numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        CASE WHEN lang = 'ar' THEN l.name_ar ELSE l.name END as name,
        l.slug,
        l.latitude,
        l.longitude
    FROM locations l
    WHERE l.parent_id = country_id
    AND l.type = 'city'
    AND l.is_active = true
    ORDER BY l.name;
END;
$$;

-- Function to get nearby cities
CREATE OR REPLACE FUNCTION public.get_nearby_cities(
    lat numeric,
    lng numeric,
    radius_km integer DEFAULT 50,
    lang text DEFAULT 'en'
)
RETURNS TABLE (
    id uuid,
    name text,
    distance numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        CASE WHEN lang = 'ar' THEN l.name_ar ELSE l.name END as name,
        point(l.longitude, l.latitude) <@> point(lng, lat) as distance
    FROM locations l
    WHERE l.type = 'city'
    AND (point(l.longitude, l.latitude) <@> point(lng, lat)) <= radius_km
    AND l.is_active = true
    ORDER BY distance;
END;
$$;

-- =======================================================
-- SECTION 4: LISTINGS AND LISTING DETAILS
-- =======================================================
CREATE TYPE contact_method AS ENUM ('phone', 'chat', 'whatsapp');

-- Create listings table
CREATE TABLE public.listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    category_id uuid REFERENCES public.categories(id) NOT NULL,
    location_id uuid REFERENCES public.locations(id),
    title text NOT NULL,
    title_ar text,
    slug text NOT NULL UNIQUE,
    description text NOT NULL,
    description_ar text,
    price decimal(12,2) NOT NULL CHECK (price >= 0),
    address text NOT NULL,
    address_ar text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    condition text CHECK (condition IN ('new', 'used')) NOT NULL,
    condition_ar text GENERATED ALWAYS AS (
        CASE condition
            WHEN 'new' THEN 'جديد'
            WHEN 'used' THEN 'مستعمل'
            ELSE condition
        END
    ) STORED,
    status text CHECK (status IN ('active', 'sold', 'unavailable')) NOT NULL DEFAULT 'active',
    contact_methods contact_method[] DEFAULT ARRAY['phone', 'chat', 'whatsapp']::contact_method[];
    is_featured boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT false,
    views_count integer NOT NULL DEFAULT 0,
    images text[] NOT NULL DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    CONSTRAINT listings_title_length CHECK (char_length(title) BETWEEN 3 AND 200),
    CONSTRAINT listings_description_length CHECK (char_length(description) BETWEEN 10 AND 5000)
);

-- Create vehicle_details table
CREATE TABLE public.vehicle_details (
    listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    brand text NOT NULL,
    model text NOT NULL,
    color text,
    color_ar text,
    version text,
    year integer NOT NULL CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    mileage integer CHECK (mileage >= 0),
    specs text,
    specs_ar text,
    sub_category text CHECK (sub_category IN ('car', 'motorcycle', 'boats', 'heavytrucks')) NOT NULL,
    payment_terms text CHECK (payment_terms IN ('rent', 'sale')) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create property_details table
CREATE TABLE public.property_details (
    listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    property_type text CHECK (property_type IN ('apartment', 'villa', 'commercial')) NOT NULL,
    bedrooms integer CHECK (bedrooms >= 0),
    bathrooms integer CHECK (bathrooms >= 0),
    square_footage decimal(10,2) CHECK (square_footage > 0),
    community text NOT NULL,
    community_ar text,
    furnished boolean NOT NULL DEFAULT false,
    payment_terms text CHECK (payment_terms IN ('rent', 'sale')) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create likes table
CREATE TABLE public.likes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    listing_id uuid REFERENCES public.listings(id) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure a user can only like a listing once
    UNIQUE(user_id, listing_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id uuid REFERENCES public.profiles(id) NOT NULL,
    reviewed_user_id uuid REFERENCES public.profiles(id) NOT NULL,
    listing_id uuid REFERENCES public.listings(id) NOT NULL,
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 1000),
    seller_response text CHECK (char_length(seller_response) BETWEEN 10 AND 1000),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure a user can only review a listing once
    UNIQUE(reviewer_id, listing_id),
    -- Prevent self-reviews
    CONSTRAINT no_self_reviews CHECK (reviewer_id != reviewed_user_id)
);

-- Create indexes for listings
CREATE INDEX listings_user_id_idx ON public.listings(user_id);
CREATE INDEX listings_category_id_idx ON public.listings(category_id);
CREATE INDEX listings_location_id_idx ON public.listings(location_id);
CREATE INDEX listings_status_idx ON public.listings(status) WHERE status = 'active';
CREATE INDEX listings_address_idx ON public.listings(address);
CREATE INDEX listings_price_idx ON public.listings(price);
CREATE INDEX listings_created_at_idx ON public.listings(created_at DESC);

-- Create indexes for likes and reviews
CREATE INDEX likes_user_id_idx ON public.likes(user_id);
CREATE INDEX likes_listing_id_idx ON public.likes(listing_id);
CREATE INDEX likes_created_at_idx ON public.likes(created_at DESC);

CREATE INDEX reviews_reviewer_id_idx ON public.reviews(reviewer_id);
CREATE INDEX reviews_reviewed_user_id_idx ON public.reviews(reviewed_user_id);
CREATE INDEX reviews_listing_id_idx ON public.reviews(listing_id);
CREATE INDEX reviews_rating_idx ON public.reviews(rating);
CREATE INDEX reviews_created_at_idx ON public.reviews(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.vehicle_details
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.property_details
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_listing_slug(title text, counter integer DEFAULT 0)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
 base_slug text;
 new_slug text;
BEGIN
 -- Convert title to slug format
 base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
 -- Remove leading/trailing hyphens
 base_slug := trim(both '-' from base_slug);

 -- Add counter if provided
 IF counter > 0 THEN
   new_slug := base_slug || '-' || counter;
 ELSE
   new_slug := base_slug;
 END IF;

 -- Check if slug exists
 WHILE EXISTS (SELECT 1 FROM listings WHERE slug = new_slug) LOOP
   counter := counter + 1;
   new_slug := base_slug || '-' || counter;
 END LOOP;

 RETURN new_slug;
END;
$$;

-- Create trigger function to set slug before insert
CREATE OR REPLACE FUNCTION set_listing_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
 IF NEW.slug IS NULL THEN
   NEW.slug := generate_listing_slug(NEW.title);
 END IF;
 RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER set_listing_slug_trigger
BEFORE INSERT ON listings
FOR EACH ROW
EXECUTE FUNCTION set_listing_slug();

-- Helper function to search listings with Arabic support
CREATE OR REPLACE FUNCTION public.search_listings(
    search_term text,
    category_id uuid DEFAULT NULL,
    location_id uuid DEFAULT NULL,
    min_price decimal DEFAULT NULL,
    max_price decimal DEFAULT NULL,
    condition_filter text DEFAULT NULL,
    lang text DEFAULT 'en'
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    price decimal,
    address text,
    images text[],
    created_at timestamp with time zone,
    category_name text,
    location_name text,
    rank float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        CASE WHEN lang = 'ar' AND l.title_ar IS NOT NULL THEN l.title_ar ELSE l.title END as title,
        CASE WHEN lang = 'ar' AND l.description_ar IS NOT NULL THEN l.description_ar ELSE l.description END as description,
        l.price,
        CASE WHEN lang = 'ar' AND l.address_ar IS NOT NULL THEN l.address_ar ELSE l.address END as address,
        l.images,
        l.created_at,
        CASE WHEN lang = 'ar' AND c.name_ar IS NOT NULL THEN c.name_ar ELSE c.name END as category_name,
        CASE WHEN lang = 'ar' AND loc.name_ar IS NOT NULL THEN loc.name_ar ELSE loc.name END as location_name,
        COALESCE(
            (CASE WHEN search_term IS NOT NULL AND search_term != '' THEN
                (ts_rank(
                    setweight(to_tsvector('simple', COALESCE(l.title, '')), 'A') ||
                    setweight(to_tsvector('simple', COALESCE(l.description, '')), 'B'),
                    plainto_tsquery('simple', search_term)
                ) +
                ts_rank(
                    setweight(to_tsvector('simple', COALESCE(l.title_ar, '')), 'A') ||
                    setweight(to_tsvector('simple', COALESCE(l.description_ar, '')), 'B'),
                    plainto_tsquery('simple', search_term)
                ))
            ELSE 0 END),
            0
        ) as rank
    FROM listings l
    JOIN categories c ON l.category_id = c.id
    LEFT JOIN locations loc ON l.location_id = loc.id
    WHERE
        l.is_active = true
        AND l.status = 'active'
        AND (
            search_term IS NULL
            OR search_term = ''
            OR l.title ILIKE '%' || search_term || '%'
            OR l.description ILIKE '%' || search_term || '%'
            OR l.title_ar ILIKE '%' || search_term || '%'
            OR l.description_ar ILIKE '%' || search_term || '%'
        )
        AND (category_id IS NULL OR l.category_id = category_id)
        AND (location_id IS NULL OR l.location_id = location_id)
        AND (min_price IS NULL OR l.price >= min_price)
        AND (max_price IS NULL OR l.price <= max_price)
        AND (condition_filter IS NULL OR l.condition = condition_filter)
    ORDER BY
        CASE WHEN search_term IS NOT NULL AND search_term != '' THEN rank ELSE NULL END DESC NULLS LAST,
        l.is_featured DESC,
        l.created_at DESC;
END;
$$;

-- Helper function to get user's active listings count
CREATE OR REPLACE FUNCTION public.get_user_active_listings_count(user_id_param uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::integer
    FROM listings
    WHERE user_id = user_id_param
    AND status = 'active'
    AND is_active = true;
$$;

-- Helper function to get user's average rating
CREATE OR REPLACE FUNCTION public.get_user_rating(user_id_param uuid)
RETURNS TABLE (
    average_rating numeric,
    total_reviews bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) as total_reviews
    FROM reviews
    WHERE reviewed_user_id = user_id_param;
$$;

-- Set up Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for listings
CREATE POLICY "Listings are viewable by everyone"
    ON public.listings FOR SELECT
    USING ((is_active = true) OR (auth.uid() = user_id) OR (public.is_admin(auth.uid())));

CREATE POLICY "Users can create their own listings"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = user_id OR (public.is_admin(auth.uid())));

CREATE POLICY "Users can delete their own listings"
    ON public.listings FOR DELETE
    USING (auth.uid() = user_id OR (public.is_admin(auth.uid())));

-- Policies for vehicle_details
CREATE POLICY "Vehicle details are viewable by everyone"
    ON public.vehicle_details FOR SELECT
    USING (true);

CREATE POLICY "Users can manage vehicle details for their listings"
    ON public.vehicle_details FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.listings
        WHERE listings.id = vehicle_details.listing_id
        AND (listings.user_id = auth.uid())
    ));

-- Policies for property_details
CREATE POLICY "Property details are viewable by everyone"
    ON public.property_details FOR SELECT
    USING (true);

CREATE POLICY "Users can manage property details for their listings"
    ON public.property_details FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.listings
        WHERE listings.id = property_details.listing_id
        AND listings.user_id = auth.uid()
    ));

-- Policies for likes
CREATE POLICY "Likes are viewable by everyone"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own likes"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own review content"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

CREATE POLICY "Sellers can respond to reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewed_user_id);

-- =======================================================
-- SECTION 5: CHAT AND MESSAGING
-- =======================================================

-- Create conversations table
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES public.listings(id) NOT NULL,
    buyer_id uuid REFERENCES public.profiles(id) NOT NULL,
    seller_id uuid REFERENCES public.profiles(id) NOT NULL,
    last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Prevent duplicate conversations for same listing-buyer pair
    UNIQUE(listing_id, buyer_id),
    -- Ensure buyer and seller are different users
    CONSTRAINT different_participants CHECK (buyer_id != seller_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) NOT NULL,
    content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    attachments text[] DEFAULT ARRAY[]::text[],
    is_system_message boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to validate message sender
CREATE OR REPLACE FUNCTION public.validate_message_sender()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_valid_sender boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM conversations
        WHERE id = NEW.conversation_id
        AND (buyer_id = NEW.sender_id OR seller_id = NEW.sender_id)
    ) INTO is_valid_sender;

    IF NOT is_valid_sender THEN
        RAISE EXCEPTION 'Invalid message sender. Sender must be either buyer or seller in the conversation.';
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for validating message sender
CREATE TRIGGER validate_message_sender
    BEFORE INSERT OR UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_message_sender();

-- Create function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

-- Create trigger for updating conversation last_message_at
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message_timestamp();

-- Create indexes
CREATE INDEX conversations_listing_id_idx ON public.conversations(listing_id);
CREATE INDEX conversations_buyer_id_idx ON public.conversations(buyer_id);
CREATE INDEX conversations_seller_id_idx ON public.conversations(seller_id);
CREATE INDEX conversations_last_message_at_idx ON public.conversations(last_message_at DESC);

CREATE INDEX messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at);
CREATE INDEX messages_read_at_null_idx ON public.messages(read_at) WHERE read_at IS NULL;

-- Set up Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() IN (buyer_id, seller_id));

CREATE POLICY "Buyers can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (
        auth.uid() = buyer_id AND
        EXISTS (
            SELECT 1 FROM listings
            WHERE id = listing_id
            AND status = 'active'
            AND user_id = seller_id
        )
    );

-- Policies for messages
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- =======================================================
-- SECTION 6: REPORTS AND NOTIFICATIONS
-- =======================================================

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
    title_ar text,
    content text NOT NULL,
    content_ar text,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX reports_reporter_id_idx ON public.reports(reporter_id);
CREATE INDEX reports_reported_user_id_idx ON public.reports(reported_user_id);
CREATE INDEX reports_listing_id_idx ON public.reports(listing_id);
CREATE INDEX reports_message_id_idx ON public.reports(message_id);
CREATE INDEX reports_status_idx ON public.reports(status);
CREATE INDEX reports_created_at_idx ON public.reports(created_at DESC);

CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_type_idx ON public.notifications(type);
CREATE INDEX notifications_reference_id_idx ON public.notifications(reference_id);
CREATE INDEX notifications_is_read_idx ON public.notifications(is_read) WHERE NOT is_read;
CREATE INDEX notifications_created_at_idx ON public.notifications(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
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

-- RLS Policies for notifications
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

-- Helper function to create localized notification
CREATE OR REPLACE FUNCTION public.create_notification(
    user_id_param uuid,
    type_param notification_type,
    reference_id_param uuid,
    title_en text,
    title_ar text,
    content_en text,
    content_ar text,
    metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id uuid;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        reference_id,
        title,
        title_ar,
        content,
        content_ar,
        metadata
    ) VALUES (
        user_id_param,
        type_param,
        reference_id_param,
        title_en,
        title_ar,
        content_en,
        content_ar,
        metadata_param
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$;

-- =======================================================
-- SECTION 7: PAYMENTS AND PACKAGES
-- =======================================================

-- Create package types
CREATE TYPE package_type_enum AS ENUM ('free_tier', 'duration', 'bulk');

-- Create packages table
CREATE TABLE packages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_product_id text NOT NULL,
    stripe_price_id text NOT NULL,
    name text NOT NULL,
    name_ar text,
    description text,
    description_ar text,
    price decimal(10,2) NOT NULL DEFAULT 0,
    package_type package_type_enum NOT NULL,
    listing_count integer NOT NULL CHECK (listing_count >= 0),
    bonus_listing_count integer DEFAULT 0 CHECK (bonus_listing_count >= 0),
    duration_days integer NOT NULL CHECK (duration_days > 0),
    bonus_duration_days integer DEFAULT 0 CHECK (bonus_duration_days >= 0),
    validity_days integer NOT NULL CHECK (validity_days > 0),
    user_limit integer CHECK (user_limit > 0),
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create user packages table
CREATE TABLE user_packages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users NOT NULL,
    package_id uuid REFERENCES packages NOT NULL,
    stripe_payment_intent_id text UNIQUE,
    amount decimal NOT NULL,
    currency text DEFAULT 'aed' NOT NULL,
    payment_status text CHECK (payment_status IN ('pending', 'succeeded', 'failed')) NOT NULL,
    status text CHECK (status IN ('pending', 'active', 'expired')) NOT NULL,
    listings_remaining integer NOT NULL CHECK (listings_remaining >= 0),
    bonus_listings_remaining integer DEFAULT 0 CHECK (bonus_listings_remaining >= 0),
    is_featured boolean DEFAULT false NOT NULL,
    activated_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create package listings table
CREATE TABLE package_listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_package_id uuid REFERENCES user_packages ON DELETE CASCADE NOT NULL,
    listing_id uuid REFERENCES listings NOT NULL,
    is_bonus_listing boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    total_days integer NOT NULL CHECK (total_days > 0),
    used_days integer DEFAULT 0 CHECK (used_days >= 0),
    remaining_days integer NOT NULL CHECK (remaining_days >= 0),
    activated_at timestamp with time zone,
    paused_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_packages_active ON packages(is_active) WHERE is_active = true;
CREATE INDEX idx_user_packages_user_id ON user_packages(user_id);
CREATE INDEX idx_user_packages_package_id ON user_packages(package_id);
CREATE INDEX idx_user_packages_status ON user_packages(status, expires_at) WHERE status = 'active';
CREATE INDEX idx_package_listings_user_package_id ON package_listings(user_package_id);
CREATE INDEX idx_package_listings_listing_id ON package_listings(listing_id);
CREATE INDEX idx_package_listings_active ON package_listings(user_package_id, expires_at)
    WHERE paused_at IS NULL;

-- Set up Row Level Security (RLS)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read-only access." ON packages FOR SELECT USING (true);

CREATE POLICY "Users can view own packages." ON user_packages
    FOR SELECT USING (auth.uid() = user_id);

-- Create a new policy allowing anyone to view package listings
CREATE POLICY "Package listings are viewable by everyone"
    ON package_listings FOR SELECT
    USING (true);

CREATE POLICY "Users can create package listings." ON package_listings
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM user_packages WHERE id = package_listings.user_package_id
        )
    );

CREATE POLICY "Users can update own package listings" ON package_listings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM user_packages WHERE id = package_listings.user_package_id
        )
    );

-- Create triggers
CREATE TRIGGER handle_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_user_packages_updated_at
    BEFORE UPDATE ON user_packages
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

-- Function to update package_listings days
CREATE OR REPLACE FUNCTION update_package_listing_days()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if the listing is active
    IF NEW.activated_at IS NOT NULL AND NEW.paused_at IS NULL THEN
        NEW.used_days := CEIL(EXTRACT(EPOCH FROM (COALESCE(NEW.paused_at, CURRENT_TIMESTAMP) - NEW.activated_at)) / 86400);
        NEW.remaining_days := GREATEST(0, NEW.total_days - NEW.used_days);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_package_listing_days_trigger
    BEFORE INSERT OR UPDATE ON package_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_package_listing_days();

-- Function to validate package listing creation
CREATE OR REPLACE FUNCTION validate_package_listing()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user_package is valid
    IF NOT EXISTS (
        SELECT 1 FROM user_packages up
        WHERE up.id = NEW.user_package_id
        AND up.listings_remaining > 0
        AND up.expires_at > CURRENT_TIMESTAMP
        AND up.status = 'active'
        AND up.payment_status = 'succeeded'
    ) THEN
        RAISE EXCEPTION 'No available listings in package or package is not active';
    END IF;

    -- Update listings_remaining
    UPDATE user_packages
    SET listings_remaining = CASE
        WHEN NEW.is_bonus_listing THEN listings_remaining
        ELSE listings_remaining - 1
    END,
    bonus_listings_remaining = CASE
        WHEN NEW.is_bonus_listing THEN bonus_listings_remaining - 1
        ELSE bonus_listings_remaining
    END
    WHERE id = NEW.user_package_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_package_listing_trigger
    BEFORE INSERT ON package_listings
    FOR EACH ROW
    EXECUTE FUNCTION validate_package_listing();

-- First, let's ensure we have the early bird package in the system with Arabic support
INSERT INTO public.packages (
    id,
    stripe_product_id,
    stripe_price_id,
    name,
    name_ar,
    description,
    description_ar,
    price,
    package_type,
    listing_count,
    bonus_listing_count,
    duration_days,
    bonus_duration_days,
    validity_days,
    user_limit,
    is_featured,
    is_active
)
VALUES (
    '7ef61d1f-dd7f-4d85-8826-d0dc46a918e1',
    'N/A',
    'N/A',
    'Early Bird',
    'الطيور المبكرة',
    'For first 1000 users only',
    'للمستخدمين الأوائل البالغ عددهم 1000 فقط',
    0,
    'free_tier',
    3,
    0,
    30,
    0,
    365,
    1000,
    FALSE,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;

-- Create a function to grant early bird package to new users
CREATE OR REPLACE FUNCTION public.grant_early_bird_package()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    early_bird_package_id uuid := '7ef61d1f-dd7f-4d85-8826-d0dc46a918e1';
    user_count integer;
    package_limit integer;
BEGIN
    -- Check if the early bird package exists and is active
    SELECT user_limit INTO package_limit
    FROM packages
    WHERE id = early_bird_package_id AND is_active = true;

    IF package_limit IS NULL THEN
        -- Early bird package not found or not active
        RETURN NEW;
    END IF;

    -- Count the number of users who already have the early bird package
    SELECT COUNT(*) INTO user_count
    FROM user_packages
    WHERE package_id = early_bird_package_id;

    -- Only grant the package if we haven't reached the limit
    IF user_count < package_limit THEN
        -- Grant the early bird package to the new user
        INSERT INTO user_packages (
            user_id,
            package_id,
            amount,
            payment_status,
            status,
            listings_remaining,
            bonus_listings_remaining,
            is_featured,
            activated_at,
            expires_at
        )
        VALUES (
            NEW.id,
            early_bird_package_id,
            0,
            'succeeded',
            'active',
            (SELECT listing_count FROM packages WHERE id = early_bird_package_id),
            (SELECT bonus_listing_count FROM packages WHERE id = early_bird_package_id),
            FALSE,
            NOW(),
            NOW() + INTERVAL '1 year'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger to automatically grant early bird package on new user creation
CREATE TRIGGER on_auth_user_created_grant_early_bird
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_early_bird_package();

-- =======================================================
-- SECTION 8: STORAGE MANAGEMENT
-- =======================================================

-- Set up Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars', 'avatars', true),
    ('logos', 'logos', true),
    ('listings', 'listings', true),
    ('verification_docs', 'verification_docs', false),
    ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage policies for company logos
CREATE POLICY "Company logos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'logos');

-- Storage policies for listings
CREATE POLICY "Listing images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listings');

CREATE POLICY "Users can upload their own listing images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'listings'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own listing images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'listings'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own listing images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'listings'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage policies for verification documents
CREATE POLICY "Users can upload their own verification documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'verification_docs'
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can access all verification documents"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'verification_docs'
        AND public.is_admin(auth.uid())
    )
    WITH CHECK (
        bucket_id = 'verification_docs'
        AND public.is_admin(auth.uid())
    );

-- Storage policies for categories
CREATE POLICY "Allow authenticated users to upload category images"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'categories' AND
        (storage.foldername(name))[1] = 'hero'
    );

CREATE POLICY "Allow public to view category images"
    ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'categories');

CREATE POLICY "Allow authenticated users to delete category images"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'categories');

CREATE POLICY "Allow authenticated users to update category images"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'categories')
    WITH CHECK (bucket_id = 'categories');
-- Run this SQL in your Supabase SQL Editor to create the chat_attachments bucket
-- and set up the necessary policies

-- Create chat_attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat attachments
-- Policy for viewing chat attachments (public access)
CREATE POLICY "Chat attachments are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'chat_attachments');

-- Policy for uploading chat attachments
CREATE POLICY "Users can upload chat attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'chat_attachments'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy for updating chat attachments
CREATE POLICY "Users can update their own chat attachments"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'chat_attachments'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy for deleting chat attachments
CREATE POLICY "Users can delete their own chat attachments"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'chat_attachments'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
-- Create a secure URL generator function for verification documents
CREATE OR REPLACE FUNCTION public.get_verification_doc_url(file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user is admin or document owner
    IF NOT (
        public.is_admin(auth.uid()) OR
        (storage.foldername(file_path))[1] = auth.uid()::text
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to verification document';
    END IF;

    RETURN storage.generate_presigned_url(
        'verification_docs'::text,
        file_path::text,
        3600 -- URL valid for 1 hour
    );
END;
$$;

-- =======================================================
-- SECTION 9: ADMIN DASHBOARD
-- =======================================================

-- Create admin dashboard view
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE is_banned = false) as active_users_count,
    (SELECT COUNT(*) FROM public.listings WHERE status = 'active' AND is_active = true) as active_listings_count,
    (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') as pending_reports_count,
    (SELECT COUNT(*) FROM public.verification_requests WHERE verification_status = 'pending') as pending_verifications_count,
    (
        WITH popular_categories AS (
            SELECT
                c.id,
                c.name,
                c.name_ar,
                COUNT(l.id) as listing_count
            FROM public.categories c
            LEFT JOIN public.listings l ON l.category_id = c.id AND l.is_active = true
            GROUP BY c.id, c.name, c.name_ar
            ORDER BY COUNT(l.id) DESC
            LIMIT 5
        )
        SELECT json_build_object(
            'en', json_build_object(
                'popular_categories', (
                    SELECT json_agg(
                        json_build_object(
                            'id', pc.id,
                            'name', pc.name,
                            'count', pc.listing_count
                        )
                    )
                    FROM popular_categories pc
                )
            ),
            'ar', json_build_object(
                'popular_categories', (
                    SELECT json_agg(
                        json_build_object(
                            'id', pc.id,
                            'name', COALESCE(pc.name_ar, pc.name),
                            'count', pc.listing_count
                        )
                    )
                    FROM popular_categories pc
                )
            )
        )
    ) as stats_by_language;
-- Create Arabic text search configuration
CREATE TEXT SEARCH CONFIGURATION public.arabic ( COPY = pg_catalog.simple );
ALTER TEXT SEARCH CONFIGURATION public.arabic
    ALTER MAPPING FOR word, asciiword, asciihword, hword, hword_part, hword_asciipart
    WITH unaccent;

-- Insert UAE locations with proper Arabic encoding
-- First ensure the table has all required columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'locations'
    ) THEN
        RAISE EXCEPTION 'The locations table does not exist. Please create it first.';
    END IF;
END
$$;

-- Insert United Arab Emirates (country)
INSERT INTO public.locations (
    id, parent_id, name, name_ar, slug, type, latitude, longitude, is_active, created_at, updated_at
)
VALUES
    ('a8c73ef2-9db4-460e-8999-79a386632bf7', NULL,
     'United Arab Emirates', 'الإمارات العربية المتحدة',
     'uae', 'country', 23.4241, 53.8478,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    slug = EXCLUDED.slug,
    type = EXCLUDED.type,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_active = EXCLUDED.is_active;

-- Insert UAE cities
INSERT INTO public.locations (
    id, parent_id, name, name_ar, slug, type, latitude, longitude, is_active, created_at, updated_at
)
VALUES
    -- Dubai
    ('25216c3e-08f6-4a56-b158-38ee29eec066', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Dubai', 'دبي',
     'dubai', 'city', 25.2048, 55.2708,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00'),

    -- Abu Dhabi
    ('3d39475c-845c-41a4-9805-f3c54ee98c1b', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Abu Dhabi', 'أبوظبي',
     'abu-dhabi', 'city', 24.4539, 54.3773,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00'),

    -- Sharjah
    ('3fafc729-3524-4a12-b67b-cb6650dab040', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Sharjah', 'الشارقة',
     'sharjah', 'city', 25.3463, 55.4209,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00'),

    -- Ajman
    ('e8cc14bf-1d75-428c-bd91-86120753497a', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Ajman', 'عجمان',
     'ajman', 'city', 25.4111, 55.4354,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00'),

    -- Ras Al Khaimah
    ('94d42eaa-4ed8-40b2-ae31-28b07ebe5b17', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Ras Al Khaimah', 'رأس الخيمة',
     'ras-al-khaimah', 'city', 25.7895, 55.9432,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00'),

    -- Fujairah
    ('6929c5f6-0972-4753-9306-95a851925d8d', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Fujairah', 'الفجيرة',
     'fujairah', 'city', 25.1288, 56.3265,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00'),

    -- Umm Al Quwain
    ('0381742c-c1d0-44d8-b818-243a4bfcb009', 'a8c73ef2-9db4-460e-8999-79a386632bf7',
     'Umm Al Quwain', 'أم القيوين',
     'umm-al-quwain', 'city', 25.5647, 55.5554,
     TRUE, '2025-02-17 19:12:15.935864+00', '2025-02-17 19:12:15.935864+00')
ON CONFLICT (id) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    slug = EXCLUDED.slug,
    type = EXCLUDED.type,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    is_active = EXCLUDED.is_active;

-- Insert packages with Arabic translations
-- First ensure the Arabic columns exist in the packages table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'packages'
        AND column_name = 'name_ar'
    ) THEN
        ALTER TABLE public.packages ADD COLUMN name_ar text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'packages'
        AND column_name = 'description_ar'
    ) THEN
        ALTER TABLE public.packages ADD COLUMN description_ar text;
    END IF;
END
$$;

-- Insert packages with Arabic translations
INSERT INTO public.packages (
    id, stripe_product_id, stripe_price_id,
    name, name_ar, description, description_ar,
    price, package_type, listing_count, bonus_listing_count,
    duration_days, bonus_duration_days, validity_days,
    user_limit, is_featured, is_active,
    created_at, updated_at
)
VALUES
    -- 5+3 Package
    ('0ac8a36f-bc96-4de2-b8d3-279a56c56402', 'prod_RntwuiCGkL1GmW', 'price_1QuI8yAky88B3WKpNIJrJqmV',
     '5+3 Package', 'باقة 5+3',
     '5 paid + 3 bonus listings (30 days per listing, valid for 12 months)',
     '5 إعلانات مدفوعة + 3 إعلانات مجانية (30 يومًا لكل إعلان، صالحة لمدة 12 شهرًا)',
     49.75, 'bulk', 5, 3,
     30, 0, 365,
     NULL, FALSE, TRUE,
     '2025-02-19 18:50:04+00', '2025-02-19 19:17:09.792732+00'),

    -- 20+10 Package
    ('7512aff1-456d-4b6a-bb69-0996d2c5bfaf', 'prod_RntxbDbYkqW000', 'price_1QuI9yAky88B3WKp8CiXVdI4',
     '20+10 Package', 'باقة 20+10',
     '20 paid + 10 bonus listings (30 days per listing, valid for 12 months)',
     '20 إعلان مدفوع + 10 إعلانات مجانية (30 يومًا لكل إعلان، صالحة لمدة 12 شهرًا)',
     199, 'bulk', 20, 10,
     30, 0, 365,
     NULL, FALSE, TRUE,
     '2025-02-19 18:46:45+00', '2025-02-19 19:17:13.397968+00'),

    -- Early Bird
    ('7ef61d1f-dd7f-4d85-8826-d0dc46a918e1', 'N/A', 'N/A',
     'Early Bird', 'الطيور المبكرة',
     'For first 1000 users only',
     'للمستخدمين الأوائل البالغ عددهم 1000 فقط',
     0, 'free_tier', 3, 0,
     30, 0, 365,
     1000, FALSE, TRUE,
     '2025-02-20 01:39:54+00', '2025-02-20 01:39:56+00'),

    -- 1 Month Plus
    ('c25d0748-0e6e-41c2-8ce7-2888994cd1e2', 'prod_RntuzhjnT7jZV2', 'price_1QuI72Aky88B3WKpYlV9snMc',
     '1 Month Plus', 'شهر واحد بلس',
     '30 days + 10 bonus days (1 listing)',
     '30 يومًا + 10 أيام إضافية (إعلان واحد)',
     9.95, 'duration', 1, 0,
     30, 10, 365,
     NULL, FALSE, TRUE,
     '2025-02-19 18:56:43+00', '2025-02-19 22:47:55.426234+00'),

    -- 3 Months Plus
    ('ce9c97e7-7632-47eb-a6f6-1aac8a0b0a45', 'prod_RntwmaCmpBMoY3', 'price_1QuI8IAky88B3WKp2h5am4CE',
     '3 Months Plus', '3 أشهر بلس',
     '90 days + 33 bonus days (1 listing)',
     '90 يومًا + 33 يومًا إضافيًا (إعلان واحد)',
     29.85, 'duration', 1, 0,
     90, 33, 365,
     NULL, FALSE, TRUE,
     '2025-02-19 18:52:45+00', '2025-02-19 22:48:10.180363+00'),

    -- 2 Months Plus
    ('ea3aca29-367f-4c33-821d-4cba515a2403', 'prod_RntvfpDESXmGTn', 'price_1QuI7hAky88B3WKpjKyeCfHn',
     '2 Months Plus', 'شهرين بلس',
     '60 days + 21 bonus days (1 listing)',
     '60 يومًا + 21 يومًا إضافيًا (إعلان واحد)',
     19.9, 'duration', 1, 0,
     60, 21, 365,
     NULL, FALSE, TRUE,
     '2025-02-19 18:55:37+00', '2025-02-19 22:48:23.728896+00'),

    -- 10+5 Package
    ('f2c7fb93-5fef-43a0-8263-dea9b6f42078', 'prod_RntxA8trvG1IaU', 'price_1QuI9XAky88B3WKpEjxxo9We',
     '10+5 Package', 'باقة 10+5',
     '10 paid + 5 bonus listings (30 days per listing, valid for 12 months)',
     '10 إعلانات مدفوعة + 5 إعلانات مجانية (30 يومًا لكل إعلان، صالحة لمدة 12 شهرًا)',
     99.5, 'bulk', 10, 5,
     30, 0, 365,
     NULL, FALSE, TRUE,
     '2025-02-19 18:47:32+00', '2025-02-19 19:17:19.541729+00')
ON CONFLICT (id) DO UPDATE SET
    stripe_product_id = EXCLUDED.stripe_product_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar,
    price = EXCLUDED.price,
    package_type = EXCLUDED.package_type,
    listing_count = EXCLUDED.listing_count,
    bonus_listing_count = EXCLUDED.bonus_listing_count,
    duration_days = EXCLUDED.duration_days,
    bonus_duration_days = EXCLUDED.bonus_duration_days,
    validity_days = EXCLUDED.validity_days,
    user_limit = EXCLUDED.user_limit,
    is_featured = EXCLUDED.is_featured,
    is_active = EXCLUDED.is_active,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

-- Insert pages with Arabic translations
-- First ensure the Arabic columns exist in the pages table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pages'
        AND column_name = 'title_ar'
    ) THEN
        ALTER TABLE public.pages ADD COLUMN title_ar text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pages'
        AND column_name = 'content_ar'
    ) THEN
        ALTER TABLE public.pages ADD COLUMN content_ar text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pages'
        AND column_name = 'meta_description_ar'
    ) THEN
        ALTER TABLE public.pages ADD COLUMN meta_description_ar text;
    END IF;
END
$$;

-- Insert the Privacy Policy page with Arabic translation
INSERT INTO public.pages (
    id, title, title_ar, slug,
    content, content_ar,
    meta_description, meta_description_ar,
    meta_keywords, is_published,
    last_updated_by, published_at,
    created_at, updated_at
)
VALUES
    ('6f262088-af5a-4cdc-83bd-9c87e2d52354',
     'Privacy Policy', 'سياسة الخصوصية',
     'privacy-policy',

     -- English content
     '## Information We Collect At Aswaq, we collect various types of information to provide and improve our services. This information includes: - Personal information (name, email address, phone number) - Account information and preferences - Transaction history and payment details - Device information and usage statistics We collect this information when you create an account, make purchases, or interact with our platform. ## How We Use Your Information We use the collected information for the following purposes: - Providing and maintaining our services - Processing your transactions and payments - Improving our platform and user experience - Communicating with you about your account and transactions - Sending promotional materials and updates (with your consent) ## Data Security We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. Your account security is also dependent on maintaining the confidentiality of your login credentials. Please notify us immediately if you suspect any unauthorized access to your account. ## Information Sharing We do not sell or rent your personal information to third parties. We may share your information with: - Service providers who assist in operating our platform - Law enforcement agencies when required by law - Other users as necessary for transaction completion > "We are committed to protecting your privacy and maintaining the trust you place in us when using our platform." ## Your Privacy Rights You have the right to: - Access your personal information - Correct inaccurate or incomplete information - Request deletion of your personal information - Opt-out of marketing communications - Export your data in a portable format',

     -- Arabic content
     '## المعلومات التي نجمعها
في أسواق، نقوم بجمع أنواع مختلفة من المعلومات لتقديم وتحسين خدماتنا. تتضمن هذه المعلومات:
- المعلومات الشخصية (الاسم، عنوان البريد الإلكتروني، رقم الهاتف)
- معلومات الحساب والتفضيلات
- تاريخ المعاملات وتفاصيل الدفع
- معلومات الجهاز وإحصاءات الاستخدام

نجمع هذه المعلومات عند إنشاء حساب، أو إجراء عمليات شراء، أو التفاعل مع منصتنا.

## كيف نستخدم معلوماتك
نستخدم المعلومات التي تم جمعها للأغراض التالية:
- تقديم والحفاظ على خدماتنا
- معالجة معاملاتك ومدفوعاتك
- تحسين منصتنا وتجربة المستخدم
- التواصل معك بشأن حسابك ومعاملاتك
- إرسال المواد الترويجية والتحديثات (بموافقتك)

## أمن البيانات
نقوم بتنفيذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية ضد الوصول غير المصرح به، أو التغيير، أو الكشف، أو التدمير. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100٪. يعتمد أمن حسابك أيضًا على الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك. يرجى إخطارنا على الفور إذا كنت تشك في أي وصول غير مصرح به إلى حسابك.

## مشاركة المعلومات
نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع:
- مقدمي الخدمات الذين يساعدون في تشغيل منصتنا
- وكالات إنفاذ القانون عندما يقتضي القانون ذلك
- المستخدمين الآخرين حسب الضرورة لإتمام المعاملة

> "نحن ملتزمون بحماية خصوصيتك والحفاظ على الثقة التي تضعها فينا عند استخدام منصتنا."

## حقوق الخصوصية الخاصة بك
لديك الحق في:
- الوصول إلى معلوماتك الشخصية
- تصحيح المعلومات غير الدقيقة أو غير المكتملة
- طلب حذف معلوماتك الشخصية
- إلغاء الاشتراك من الاتصالات التسويقية
- تصدير بياناتك بتنسيق قابل للنقل',

     -- Meta descriptions
     'Our privacy policy and data handling practices',
     'سياسة الخصوصية وممارسات التعامل مع البيانات لدينا',

     NULL, TRUE, NULL, '2025-01-13 20:33:07.238+00',
     '2025-01-12 19:22:18.945885+00', '2025-02-19 14:05:09.102777+00'),

    -- Terms & Conditions with Arabic translation
    ('ee046543-6e6c-40b5-8037-f19dcb079cb9',
     'Terms & Conditions', 'الشروط والأحكام',
     'terms-of-service',

     -- English content
     '## Terms and Conditions for Aswaq Welcome to our Aswaq website! By using our platform, you agree to comply with the following terms and conditions. Please read them carefully before engaging in any transactions. Users must be at least 18 years old to create an account. All users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. ## User Responsibilities As a user, you agree to provide accurate information when creating your profile and to update it as necessary. You must not engage in any fraudulent activities or misrepresent your identity. All transactions conducted through our website are at your own risk. We do not guarantee the quality or legality of the items sold, nor do we endorse any sellers. ## Dispute Resolution In the event of a dispute between users, we encourage you to resolve it amicably. If necessary, we can provide mediation services to assist in reaching a resolution. ## Limitation of Liability Our website is provided on an "as is" basis. We are not liable for any damages arising from the use of our platform, including but not limited to loss of profits or data. > "By using our website, you acknowledge that you have read and understood these terms and conditions. If you > do not agree with any part of these terms, please do not use our services." ## Modifications to Terms We reserve the right to modify these terms at any time. Users will be notified of any significant changes, and continued use of the website constitutes acceptance of the new terms.',

     -- Arabic content
     '## الشروط والأحكام لأسواق
مرحبًا بكم في موقع أسواق! باستخدام منصتنا، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل المشاركة في أي معاملات.

يجب أن يكون المستخدمون على الأقل 18 عامًا لإنشاء حساب. جميع المستخدمين مسؤولون عن الحفاظ على سرية معلومات حسابهم وعن جميع الأنشطة التي تحدث تحت حسابهم.

## مسؤوليات المستخدم
بصفتك مستخدمًا، فإنك توافق على تقديم معلومات دقيقة عند إنشاء ملفك الشخصي وتحديثها عند الضرورة. يجب ألا تشارك في أي أنشطة احتيالية أو تحريف هويتك.

جميع المعاملات التي تتم من خلال موقعنا على مسؤوليتك الخاصة. نحن لا نضمن جودة أو قانونية العناصر المباعة، ولا نؤيد أي بائعين.

## حل النزاعات
في حالة وجود نزاع بين المستخدمين، نشجعك على حله بطريقة ودية. إذا لزم الأمر، يمكننا تقديم خدمات الوساطة للمساعدة في التوصل إلى حل.

## حدود المسؤولية
يتم توفير موقعنا الإلكتروني "كما هو". نحن لسنا مسؤولين عن أي أضرار ناتجة عن استخدام منصتنا، بما في ذلك على سبيل المثال لا الحصر خسارة الأرباح أو البيانات.

> "باستخدام موقعنا، فإنك تقر بأنك قد قرأت وفهمت هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فالرجاء عدم استخدام خدماتنا."

## التعديلات على الشروط
نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات كبيرة، واستمرار استخدام الموقع يشكل قبولًا للشروط الجديدة.',

     -- Meta descriptions
     'Terms and conditions for using our platform',
     'الشروط والأحكام لاستخدام منصتنا',

     NULL, TRUE, NULL, '2025-01-12 19:22:18.945885+00',
     '2025-01-12 19:22:18.945885+00', '2025-02-17 20:47:19.012366+00')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ar = EXCLUDED.title_ar,
    slug = EXCLUDED.slug,
    content = EXCLUDED.content,
    content_ar = EXCLUDED.content_ar,
    meta_description = EXCLUDED.meta_description,
    meta_description_ar = EXCLUDED.meta_description_ar,
    meta_keywords = EXCLUDED.meta_keywords,
    is_published = EXCLUDED.is_published,
    last_updated_by = EXCLUDED.last_updated_by,
    published_at = EXCLUDED.published_at;

-- Insert or update categories with English and Arabic support
INSERT INTO public.categories (
    id,
    parent_id,
    name,
    name_ar,
    slug,
    description,
    description_ar,
    icon,
    display_order,
    is_active,
    created_at,
    updated_at,
    display_in_header,
    display_in_hero,
    hero_image,
    display_in_home
)
VALUES
    ('0ae154b5-84d1-4f73-9ab7-6397f1a14158', NULL, 'Tools', 'أدوات', 'tools', 'Tools and equipment', 'أدوات ومعدات', 'hammer', 6, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 06:29:40.101429+00', TRUE, TRUE, 'https://pefagpxcatbzpqoqchhj.supabase.co/storage/v1/object/public/categories/categories/hero/1737527376572.png', FALSE),

    ('43dccd74-2eea-4a63-a515-f47fd48c7eed', NULL, 'Properties', 'عقارات', 'properties', 'Apartments, villas, and commercial properties', 'شقق، فلل، وعقارات تجارية', 'building-2', 2, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 06:26:31.756598+00', TRUE, TRUE, 'https://pefagpxcatbzpqoqchhj.supabase.co/storage/v1/object/public/categories/categories/hero/1737527188027.png', FALSE),

    ('506baeab-f272-4000-80da-640b33a2c97b', 'c3b6bfc9-19a8-4c55-b2ae-7d5699755c75', 'Motorcycles', 'دراجات نارية', 'motorcycles', 'Motorcycles and scooters', 'دراجات نارية وسكوترات', NULL, 2, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:17:52.484631+00', FALSE, FALSE, NULL, FALSE),

    ('56abfe44-0e0e-48a8-9c7b-3295e2bd8daa', '43dccd74-2eea-4a63-a515-f47fd48c7eed', 'Commercial', 'تجاري', 'commercial', 'Offices, shops, and warehouses', 'مكاتب، محلات، ومستودعات', NULL, 3, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:18:50.798415+00', FALSE, FALSE, NULL, FALSE),

    ('6c3f0f07-9526-4456-a44d-321e57b7a664', NULL, 'Fashion', 'أزياء', 'fashion', 'Clothing, accessories, and jewelry', 'ملابس، إكسسوارات، ومجوهرات', 'shirt', 5, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 06:40:55.779951+00', TRUE, TRUE, 'https://pefagpxcatbzpqoqchhj.supabase.co/storage/v1/object/public/categories/categories/hero/1737528049232.png', FALSE),

    ('9de4a08e-f907-4c4d-bc4e-e46efaa734a4', 'c3b6bfc9-19a8-4c55-b2ae-7d5699755c75', 'Cars', 'سيارات', 'cars', 'New and used cars for sale', 'سيارات جديدة ومستعملة للبيع', NULL, 1, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:17:59.951102+00', FALSE, FALSE, NULL, FALSE),

    ('9f069147-e947-4535-907a-0414dfa454b8', '43dccd74-2eea-4a63-a515-f47fd48c7eed', 'Apartments', 'شقق', 'apartments', 'Apartments and flats', 'شقق وأبارتمنتات', NULL, 1, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:18:32.922525+00', FALSE, FALSE, NULL, FALSE),

    ('a9bfed59-2f77-4f68-9d12-d4fc773542b5', NULL, 'Electronics', 'إلكترونيات', 'electronics', 'Phones, computers, and other electronic devices', 'هواتف، أجهزة كمبيوتر، وأجهزة إلكترونية أخرى', 'tablet-smartphone', 3, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 06:28:58.333321+00', TRUE, TRUE, 'https://pefagpxcatbzpqoqchhj.supabase.co/storage/v1/object/public/categories/categories/hero/1737527331973.png', FALSE),

    ('bd3f2677-384b-4cca-bc4f-b51076fe46a8', 'c3b6bfc9-19a8-4c55-b2ae-7d5699755c75', 'Boats', 'قوارب', 'boats', 'Boats and marine vehicles', 'قوارب ومركبات بحرية', NULL, 3, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:18:09.762883+00', FALSE, FALSE, NULL, FALSE),

    ('c3b6bfc9-19a8-4c55-b2ae-7d5699755c75', NULL, 'Vehicles', 'مركبات', 'vehicles', 'Cars, motorcycles, boats, and other vehicles', 'سيارات، دراجات نارية، قوارب، ومركبات أخرى', 'Vehicles', 1, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 06:25:05.769766+00', TRUE, TRUE, 'https://pefagpxcatbzpqoqchhj.supabase.co/storage/v1/object/public/categories/categories/hero/1737527094728.png', FALSE),

    ('c8762454-5586-464a-8bf3-f987b76e7d09', '43dccd74-2eea-4a63-a515-f47fd48c7eed', 'Land', 'أراضي', 'land', 'Residential and commercial land', 'أراضي سكنية وتجارية', NULL, 4, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:19:04.727967+00', FALSE, FALSE, NULL, FALSE),

    ('d96e107a-f4bd-4afb-a2c2-9a978ef52a62', 'c3b6bfc9-19a8-4c55-b2ae-7d5699755c75', 'Heavy Trucks', 'شاحنات ثقيلة', 'heavy-trucks', 'Commercial trucks and heavy machinery', 'شاحنات تجارية وآليات ثقيلة', NULL, 4, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:18:19.969799+00', FALSE, FALSE, NULL, FALSE),

    ('ec0667d3-ca27-4725-b380-dc049680d0f7', NULL, 'Furniture', 'أثاث', 'furniture', 'Home and office furniture', 'أثاث المنزل والمكتب', 'Sofa', 4, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 06:29:22.759497+00', TRUE, TRUE, 'https://pefagpxcatbzpqoqchhj.supabase.co/storage/v1/object/public/categories/categories/hero/1737527358495.png', FALSE),

    ('f4b90fed-9b83-4d63-a49b-391a8a31747a', '43dccd74-2eea-4a63-a515-f47fd48c7eed', 'Villas', 'فلل', 'villas', 'Villas and townhouses', 'فلل ومنازل متلاصقة', NULL, 2, TRUE, '2025-01-15 09:28:50.543978+00', '2025-01-22 05:18:41.357748+00', FALSE, FALSE, NULL, FALSE)
ON CONFLICT (id) DO UPDATE
SET
    parent_id = EXCLUDED.parent_id,
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    description_ar = EXCLUDED.description_ar,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    display_in_header = EXCLUDED.display_in_header,
    display_in_hero = EXCLUDED.display_in_hero,
    hero_image = EXCLUDED.hero_image,
    display_in_home = EXCLUDED.display_in_home;

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,  -- Optional field
    subject text NOT NULL,
    message text NOT NULL,
    status text CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')) NOT NULL DEFAULT 'new',
    locale text NOT NULL DEFAULT 'en',  -- For localization support
    admin_notes text,  -- For staff to add notes
    assigned_to uuid REFERENCES public.profiles(id),  -- Admin who is handling this submission
    is_spam boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone
);

-- Create updated_at trigger (reusing your existing function)
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX contact_submissions_status_idx ON public.contact_submissions(status);
CREATE INDEX contact_submissions_created_at_idx ON public.contact_submissions(created_at DESC);
CREATE INDEX contact_submissions_assigned_to_idx ON public.contact_submissions(assigned_to)
  WHERE assigned_to IS NOT NULL;

-- Set up Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Contact submissions are viewable by admin only"
    ON public.contact_submissions FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Contact submissions are insertable by everyone"
    ON public.contact_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Contact submissions are updatable by admin only"
    ON public.contact_submissions FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Optional: Create a view for admin dashboard
CREATE OR REPLACE VIEW public.contact_submissions_stats AS
SELECT
    (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'new') as new_submissions_count,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'in_progress') as in_progress_submissions_count,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'resolved') as resolved_submissions_count,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE is_spam = true) as spam_submissions_count,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE created_at > (now() - interval '24 hours')) as submissions_last_24h,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE created_at > (now() - interval '7 days')) as submissions_last_7d;


-- Add notification_sent column to messages table
ALTER TABLE public.messages
ADD COLUMN notification_sent timestamp with time zone;

-- Create index for efficient querying of unread messages without notifications
CREATE INDEX messages_unread_notification_idx ON public.messages(read_at, notification_sent, created_at)
WHERE read_at IS NULL AND notification_sent IS NULL;

-- Add notification preferences to profiles table if it doesn't exist
-- First check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN notification_preferences jsonb DEFAULT jsonb_build_object(
            'chat_email', true,
            'listing_activity', true,
            'marketing', false
        );
    END IF;
END $$;

-- Add locale column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'locale'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN locale text DEFAULT 'en';
    END IF;
END $$;

-- 1. Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN email text UNIQUE;

-- 2. Update existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Make email NOT NULL after populating data
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL;

-- 4. Modify the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        phone_number,
        avatar_url,
        preferred_language,
        email
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        NEW.email
    );

    -- Assign default 'user' role
    INSERT INTO public.user_roles (id, role_id)
    SELECT NEW.id, r.id
    FROM public.roles r
    WHERE r.name = 'user';

    RETURN NEW;
END;
$$;