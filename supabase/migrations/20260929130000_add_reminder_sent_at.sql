-- Agregar columna reminder_sent_at para controlar el envío de recordatorios de transferencia
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;
