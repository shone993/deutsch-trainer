-- Enable Row-Level Security on all public tables.
-- Prisma connects via DIRECT_URL (postgres superuser) and bypasses RLS,
-- so existing server-side queries are unaffected.
-- These policies only restrict direct PostgREST / anon-key access.

-- ─── Enable RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verbs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentences         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_verbs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouns             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words             ENABLE ROW LEVEL SECURITY;

-- ─── Content tables: authenticated users can read ─────────────────────────────
CREATE POLICY "verbs_select"     ON public.verbs     FOR SELECT TO authenticated USING (true);
CREATE POLICY "sentences_select" ON public.sentences FOR SELECT TO authenticated USING (true);
CREATE POLICY "nouns_select"     ON public.nouns     FOR SELECT TO authenticated USING (true);
CREATE POLICY "words_select"     ON public.words     FOR SELECT TO authenticated USING (true);

-- ─── users: read/update own row ───────────────────────────────────────────────
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated USING (auth.uid()::text = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid()::text = id);

-- ─── stats: manage own rows ───────────────────────────────────────────────────
CREATE POLICY "stats_select_own" ON public.stats
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "stats_insert_own" ON public.stats
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "stats_update_own" ON public.stats
  FOR UPDATE TO authenticated USING (auth.uid()::text = user_id);

-- ─── saved_verbs: manage own rows ────────────────────────────────────────────
CREATE POLICY "saved_verbs_select_own" ON public.saved_verbs
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "saved_verbs_insert_own" ON public.saved_verbs
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "saved_verbs_delete_own" ON public.saved_verbs
  FOR DELETE TO authenticated USING (auth.uid()::text = user_id);

-- ─── exercise_sessions: manage own rows ───────────────────────────────────────
CREATE POLICY "exercise_sessions_select_own" ON public.exercise_sessions
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "exercise_sessions_insert_own" ON public.exercise_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- ─── streaks: manage own row ──────────────────────────────────────────────────
CREATE POLICY "streaks_select_own" ON public.streaks
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "streaks_update_own" ON public.streaks
  FOR UPDATE TO authenticated USING (auth.uid()::text = user_id);

-- ─── user_settings: manage own rows ──────────────────────────────────────────
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE TO authenticated USING (auth.uid()::text = user_id);
