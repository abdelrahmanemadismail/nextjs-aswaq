-- Create categories table
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid REFERENCES public.categories(id),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    display_in_header boolean NOT NULL DEFAULT false,
    display_in_hero boolean NOT NULL DEFAULT false,
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

-- Create indexes
CREATE INDEX categories_parent_id_idx ON public.categories(parent_id);
CREATE INDEX categories_slug_idx ON public.categories(slug);
CREATE INDEX categories_display_order_idx ON public.categories(display_order);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Set up Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Helper functions
-- Function to get category path (breadcrumb)
CREATE OR REPLACE FUNCTION public.get_category_path(category_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
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
            c.slug,
            1 as level
        FROM categories c
        WHERE c.id = category_id
        
        UNION ALL
        
        -- Recursive case: join with parent categories
        SELECT 
            c.id,
            c.name,
            c.slug,
            cp.level + 1
        FROM categories c
        INNER JOIN category_path cp ON c.id = cp.id
        WHERE c.parent_id IS NOT NULL
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

-- Insert initial categories
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
    ('Vehicles', 'vehicles', 'Cars, motorcycles, boats, and other vehicles', 'car', 1),
    ('Properties', 'properties', 'Apartments, villas, and commercial properties', 'home', 2),
    ('Electronics', 'electronics', 'Phones, computers, and other electronic devices', 'smartphone', 3),
    ('Furniture', 'furniture', 'Home and office furniture', 'chair', 4),
    ('Fashion', 'fashion', 'Clothing, accessories, and jewelry', 'shirt', 5),
    ('Services', 'services', 'Professional and personal services', 'tool', 6)
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;

-- Insert subcategories for Vehicles
INSERT INTO public.categories (parent_id, name, slug, description, icon, display_order)
SELECT 
    id as parent_id,
    unnest(ARRAY['Cars', 'Motorcycles', 'Boats', 'Heavy Trucks']) as name,
    unnest(ARRAY['cars', 'motorcycles', 'boats', 'heavy-trucks']) as slug,
    unnest(ARRAY[
        'New and used cars for sale',
        'Motorcycles and scooters',
        'Boats and marine vehicles',
        'Commercial trucks and heavy machinery'
    ]) as description,
    unnest(ARRAY['car', 'motorcycle', 'boat', 'truck']) as icon,
    generate_series(1, 4) as display_order
FROM public.categories
WHERE slug = 'vehicles'
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;

-- Insert subcategories for Properties
INSERT INTO public.categories (parent_id, name, slug, description, icon, display_order)
SELECT 
    id as parent_id,
    unnest(ARRAY['Apartments', 'Villas', 'Commercial', 'Land']) as name,
    unnest(ARRAY['apartments', 'villas', 'commercial', 'land']) as slug,
    unnest(ARRAY[
        'Apartments and flats',
        'Villas and townhouses',
        'Offices, shops, and warehouses',
        'Residential and commercial land'
    ]) as description,
    unnest(ARRAY['apartment', 'home', 'building', 'map']) as icon,
    generate_series(1, 4) as display_order
FROM public.categories
WHERE slug = 'properties'
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;



-- Create the storage bucket for categories
INSERT INTO storage.buckets (id, name, public) 
VALUES ('categories', 'categories', true);

-- Create policy to allow authenticated users to upload category images
CREATE POLICY "Allow authenticated users to upload category images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'categories' AND 
  (storage.foldername(name))[1] = 'hero'
);

-- Create policy to allow public to view category images
CREATE POLICY "Allow public to view category images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'categories');

-- Create policy to allow authenticated users to delete their uploaded images
CREATE POLICY "Allow authenticated users to delete category images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'categories');

-- Create policy to allow authenticated users to update category images
CREATE POLICY "Allow authenticated users to update category images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'categories')
WITH CHECK (bucket_id = 'categories');