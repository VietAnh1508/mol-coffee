CREATE TABLE IF NOT EXISTS public.feature_acknowledgments (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    feature_key      TEXT NOT NULL,
    acknowledged_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT feature_acknowledgments_unique UNIQUE (user_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_feature_acknowledgments_user
    ON public.feature_acknowledgments(user_id);

DROP TRIGGER IF EXISTS update_feature_acknowledgments_updated_at
    ON public.feature_acknowledgments;

CREATE TRIGGER update_feature_acknowledgments_updated_at
    BEFORE UPDATE ON public.feature_acknowledgments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.feature_acknowledgments ENABLE ROW LEVEL SECURITY;

-- user_id references public.users(id) (internal UUID), not auth.users.id
DROP POLICY IF EXISTS "Users can read own feature acknowledgments"
    ON public.feature_acknowledgments;

CREATE POLICY "Users can read own feature acknowledgments"
    ON public.feature_acknowledgments FOR SELECT
    USING (user_id = get_user_by_auth_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own feature acknowledgments"
    ON public.feature_acknowledgments;

CREATE POLICY "Users can insert own feature acknowledgments"
    ON public.feature_acknowledgments FOR INSERT
    WITH CHECK (user_id = get_user_by_auth_id(auth.uid()));
