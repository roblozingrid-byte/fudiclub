-- Trigger para Customers
DROP TRIGGER IF EXISTS "sync_customer_to_sheets" ON "public"."customers";
CREATE TRIGGER "sync_customer_to_sheets"
AFTER INSERT ON "public"."customers"
FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request"(
  'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1/sync-to-sheets',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '1000'
);

-- Trigger para Orders
DROP TRIGGER IF EXISTS "sync_order_to_sheets" ON "public"."orders";
CREATE TRIGGER "sync_order_to_sheets"
AFTER INSERT ON "public"."orders"
FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request"(
  'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1/sync-to-sheets',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '1000'
);

-- Trigger para Waitlist
DROP TRIGGER IF EXISTS "sync_waitlist_to_sheets" ON "public"."waitlist";
CREATE TRIGGER "sync_waitlist_to_sheets"
AFTER INSERT ON "public"."waitlist"
FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request"(
  'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1/sync-to-sheets',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '1000'
);
