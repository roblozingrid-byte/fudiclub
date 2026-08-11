-- Habilitar Row-Level Security en todas las tablas para proteger los datos de acceso público
-- Como la aplicación usa Edge Functions con SUPABASE_SERVICE_ROLE_KEY, no necesitamos
-- políticas de RLS (el service role ignora RLS), pero sí necesitamos que esté activado
-- para bloquear el acceso a través del anon key.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
