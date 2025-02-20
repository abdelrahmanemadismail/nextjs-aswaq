-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql security definer;


/**
* PACKAGES
* Note: These are our application-specific package configurations.
*/
CREATE TYPE package_type_enum AS ENUM ('free_tier', 'duration', 'bulk');
CREATE TABLE packages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_product_id text NOT NULL,
    stripe_price_id text NOT NULL,
    name text NOT NULL,
    description text,
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

CREATE TRIGGER handle_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

CREATE INDEX idx_packages_active ON packages(is_active) WHERE is_active = true;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON packages FOR SELECT USING (true);

/**
* USER PACKAGES
* Note: Created when a user purchases or is granted a package.
*/
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

CREATE TRIGGER handle_user_packages_updated_at
    BEFORE UPDATE ON user_packages
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

CREATE INDEX idx_user_packages_user_id ON user_packages(user_id);
CREATE INDEX idx_user_packages_package_id ON user_packages(package_id);
CREATE INDEX idx_user_packages_status ON user_packages(status, expires_at) WHERE status = 'active';

ALTER TABLE user_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own packages." ON user_packages 
    FOR SELECT USING (auth.uid() = user_id);

/**
* PACKAGE LISTINGS
* Note: Tracks listing usage within packages.
*/
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

CREATE INDEX idx_package_listings_user_package_id ON package_listings(user_package_id);
CREATE INDEX idx_package_listings_listing_id ON package_listings(listing_id);
CREATE INDEX idx_package_listings_active ON package_listings(user_package_id, expires_at) 
    WHERE paused_at IS NULL;

ALTER TABLE package_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own package listings." ON package_listings
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_packages WHERE id = package_listings.user_package_id
        )
    );

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

-- First, let's ensure we have the early bird package in the system
INSERT INTO public.packages (
    id, 
    stripe_product_id, 
    stripe_price_id, 
    name, 
    description, 
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
    'For first 1000 users only', 
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
ON CONFLICT (id) DO NOTHING;

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