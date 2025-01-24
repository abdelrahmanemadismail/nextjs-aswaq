-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the listings table
CREATE TABLE public.listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    category_id uuid REFERENCES public.categories(id) NOT NULL,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text NOT NULL,
    price decimal(12,2) NOT NULL CHECK (price >= 0),
    location text NOT NULL,
    condition text CHECK (condition IN ('new', 'used')) NOT NULL,
    status text CHECK (status IN ('active', 'sold', 'unavailable')) NOT NULL DEFAULT 'active',
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
    version text,
    year integer NOT NULL CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    mileage integer CHECK (mileage >= 0),
    specs text,
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
    furnished boolean NOT NULL DEFAULT false,
    payment_terms text CHECK (payment_terms IN ('rent', 'sale')) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX listings_user_id_idx ON public.listings(user_id);
CREATE INDEX listings_category_id_idx ON public.listings(category_id);
CREATE INDEX listings_status_idx ON public.listings(status) WHERE status = 'active';
CREATE INDEX listings_location_idx ON public.listings(location);
CREATE INDEX listings_price_idx ON public.listings(price);
CREATE INDEX listings_created_at_idx ON public.listings(created_at DESC);

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

-- Set up Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_details ENABLE ROW LEVEL SECURITY;

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

-- Helper function to check if user can create new listing
CREATE OR REPLACE FUNCTION public.can_create_listing(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        CASE 
            WHEN public.get_user_listing_limit(user_id_param) = -1 THEN true
            ELSE public.get_user_active_listings_count(user_id_param) < public.get_user_listing_limit(user_id_param)
        END;
$$;

-- Enable storage for listings
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Storage policies for listings
create policy "Listing images are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'listings');

create policy "Users can upload their own listing images"
    on storage.objects for insert
    with check (
        bucket_id = 'listings' 
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can update their own listing images"
    on storage.objects for update
    using (
        bucket_id = 'listings' 
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can delete their own listing images"
    on storage.objects for delete
    using (
        bucket_id = 'listings' 
        and (storage.foldername(name))[1] = auth.uid()::text
    );



-- Create function to generate slug from title
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

-- Update existing listings with slugs
UPDATE listings
SET slug = generate_listing_slug(title)
WHERE slug IS NULL;