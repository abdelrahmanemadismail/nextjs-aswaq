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