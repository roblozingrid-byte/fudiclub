-- Trigger para Waitlist: sync on INSERT or UPDATE of note
DROP TRIGGER IF EXISTS "sync_waitlist_to_sheets" ON "public"."waitlist";
CREATE TRIGGER "sync_waitlist_to_sheets"
AFTER INSERT OR UPDATE OF "note" ON "public"."waitlist"
FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request"(
  'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1/sync-to-sheets',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '1000'
);
