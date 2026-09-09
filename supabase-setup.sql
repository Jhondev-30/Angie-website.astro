-- =============================================================================
-- Supabase — tabla de leads para /resources/
-- Dónde correrlo: Supabase dashboard → SQL Editor → New query → pegar → Run
-- =============================================================================

-- Tabla principal: solo email + id (como pediste)
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para que las búsquedas por email sean rápidas
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at DESC);

-- Vista opcional: cuántos leads se registran por día
CREATE OR REPLACE VIEW daily_leads AS
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS total
FROM subscribers
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- GRANT: necesario para que la service_role key pueda insertar/seleccionar.
-- Sin esto, Supabase devuelve 403 "permission denied for table subscribers".
GRANT SELECT, INSERT ON public.subscribers TO service_role;
