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

-- Create indexes
CREATE INDEX likes_user_id_idx ON public.likes(user_id);
CREATE INDEX likes_listing_id_idx ON public.likes(listing_id);
CREATE INDEX likes_created_at_idx ON public.likes(created_at DESC);

CREATE INDEX reviews_reviewer_id_idx ON public.reviews(reviewer_id);
CREATE INDEX reviews_reviewed_user_id_idx ON public.reviews(reviewed_user_id);
CREATE INDEX reviews_listing_id_idx ON public.reviews(listing_id);
CREATE INDEX reviews_rating_idx ON public.reviews(rating);
CREATE INDEX reviews_created_at_idx ON public.reviews(created_at DESC);

-- Create trigger for updated_at on reviews
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Set up Row Level Security (RLS)
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewer_id)
    WITH CHECK (
        -- Only allow updating comment and rating
        OLD.reviewer_id = NEW.reviewer_id AND
        OLD.reviewed_user_id = NEW.reviewed_user_id AND
        OLD.listing_id = NEW.listing_id
    );

CREATE POLICY "Sellers can respond to their reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = reviewed_user_id)
    WITH CHECK (
        -- Only allow updating seller_response
        OLD.reviewer_id = NEW.reviewer_id AND
        OLD.reviewed_user_id = NEW.reviewed_user_id AND
        OLD.listing_id = NEW.listing_id AND
        OLD.rating = NEW.rating AND
        OLD.comment = NEW.comment
    );

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

-- Helper function to get listing's likes count
CREATE OR REPLACE FUNCTION public.get_listing_likes_count(listing_id_param uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)
    FROM likes
    WHERE listing_id = listing_id_param;
$$;

-- Helper function to check if user has liked a listing
CREATE OR REPLACE FUNCTION public.has_user_liked_listing(user_id_param uuid, listing_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM likes
        WHERE user_id = user_id_param
        AND listing_id = listing_id_param
    );
$$;

-- Helper function to check if user can review a listing
CREATE OR REPLACE FUNCTION public.can_user_review_listing(reviewer_id_param uuid, listing_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (
        SELECT 1
        FROM reviews
        WHERE reviewer_id = reviewer_id_param
        AND listing_id = listing_id_param
    );
$$;