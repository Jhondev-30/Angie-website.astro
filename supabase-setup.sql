-- =============================================================================
-- Supabase — tabla de leads para /resources/
-- Dónde correrlo: Supabase dashboard → SQL Editor → New query → pegar → Run
--
-- Si ya corriste una versión anterior y la tabla existe, este script es
-- idempotente: usa IF NOT EXISTS y GRANT ALL para arreglar permisos en
-- tablas existentes. Para un fix más agresivo, corre primero:
--   DROP TABLE IF EXISTS public.subscribers CASCADE;
-- y después este script completo.
-- =============================================================================

-- 1. Tabla principal: solo email + id
CREATE TABLE IF NOT EXISTS public.subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at DESC);

-- 3. Vista opcional: cuántos leads se registran por día
CREATE OR REPLACE VIEW public.daily_leads AS
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS total
FROM public.subscribers
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- 4. Permisos: la service_role key usada por la Vercel function necesita
--    GRANTs explícitos. Sin esto, devuelve 403 "permission denied".
--    NOTA: este GRANT cubre tablas y secuencias usadas por BIGSERIAL.
DO $$
BEGIN
  EXECUTE 'GRANT USAGE ON SCHEMA public TO service_role';
  EXECUTE 'GRANT SELECT, INSERT ON public.subscribers TO service_role';
  EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role';
  EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.subscribers_id_seq TO service_role';
END $$;

-- 5. RLS: service_role bypasea RLS, pero por las dudas lo desactivamos.
--    Si más adelante quieres políticas de RLS, reactívalo con un policy
--    que permita INSERT desde service_role.
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;
