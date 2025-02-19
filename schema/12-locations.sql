-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- Create locations table with country/city structure
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
    -- Ensure cities have country as parent
    CONSTRAINT locations_hierarchy_check CHECK (
        (type = 'country' AND parent_id IS NULL) OR
        (type = 'city' AND parent_id IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX locations_parent_id_idx ON public.locations(parent_id);
CREATE INDEX locations_slug_idx ON public.locations(slug);
CREATE INDEX locations_type_idx ON public.locations(type);
CREATE INDEX locations_coordinates_idx ON public.locations(latitude, longitude);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Set up Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policies for locations
CREATE POLICY "Locations are viewable by everyone"
    ON public.locations FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage locations"
    ON public.locations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Helper function to get city with country
CREATE OR REPLACE FUNCTION public.get_city_with_country(city_id uuid)
RETURNS TABLE (
    city_id uuid,
    city_name text,
    city_name_ar text,
    city_slug text,
    country_id uuid,
    country_name text,
    country_name_ar text,
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
        c.name as city_name,
        c.name_ar as city_name_ar,
        c.slug as city_slug,
        co.id as country_id,
        co.name as country_name,
        co.name_ar as country_name_ar,
        co.slug as country_slug
    FROM locations c
    JOIN locations co ON c.parent_id = co.id
    WHERE c.id = city_id
    AND c.type = 'city'
    AND co.type = 'country';
END;
$$;

-- Function to get cities in country
CREATE OR REPLACE FUNCTION public.get_cities_in_country(country_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    name_ar text,
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
        l.name,
        l.name_ar,
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
    radius_km integer DEFAULT 50
)
RETURNS TABLE (
    id uuid,
    name text,
    name_ar text,
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
        l.name,
        l.name_ar,
        point(l.longitude, l.latitude) <@> point(lng, lat) as distance
    FROM locations l
    WHERE l.type = 'city'
    AND (point(l.longitude, l.latitude) <@> point(lng, lat)) <= radius_km
    AND l.is_active = true
    ORDER BY distance;
END;
$$;

-- Add location_id to listings table
ALTER TABLE public.listings
ADD COLUMN location_id uuid REFERENCES public.locations(id);

-- Create index on location_id in listings
CREATE INDEX listings_location_id_idx ON public.listings(location_id);

-- Insert initial data
DO $$
DECLARE
    uae_id uuid;
BEGIN
    -- Insert UAE as country
    INSERT INTO public.locations (name, name_ar, slug, type, latitude, longitude)
    VALUES ('United Arab Emirates', 'الإمارات العربية المتحدة', 'uae', 'country', 23.4241, 53.8478)
    ON CONFLICT (slug) DO UPDATE
    SET 
        name = EXCLUDED.name,
        name_ar = EXCLUDED.name_ar,
        type = EXCLUDED.type,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude
    RETURNING id INTO uae_id;

    -- Insert major UAE cities
    INSERT INTO public.locations (parent_id, name, name_ar, slug, type, latitude, longitude)
    VALUES 
        (uae_id, 'Dubai', 'دبي', 'dubai', 'city', 25.2048, 55.2708),
        (uae_id, 'Abu Dhabi', 'أبوظبي', 'abu-dhabi', 'city', 24.4539, 54.3773),
        (uae_id, 'Sharjah', 'الشارقة', 'sharjah', 'city', 25.3463, 55.4209),
        (uae_id, 'Ajman', 'عجمان', 'ajman', 'city', 25.4111, 55.4354),
        (uae_id, 'Ras Al Khaimah', 'رأس الخيمة', 'ras-al-khaimah', 'city', 25.7895, 55.9432),
        (uae_id, 'Fujairah', 'الفجيرة', 'fujairah', 'city', 25.1288, 56.3265),
        (uae_id, 'Umm Al Quwain', 'أم القيوين', 'umm-al-quwain', 'city', 25.5647, 55.5554)
    ON CONFLICT (slug) DO UPDATE
    SET 
        name = EXCLUDED.name,
        name_ar = EXCLUDED.name_ar,
        type = EXCLUDED.type,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude;
END $$;