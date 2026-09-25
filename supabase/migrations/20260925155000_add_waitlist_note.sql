-- Add note column to waitlist table for capturing lead source / out-of-zone notes
ALTER TABLE "public"."waitlist" ADD COLUMN IF NOT EXISTS "note" text;
