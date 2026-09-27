-- Agregar columnas de cantidad y total de boxes para pedidos
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_boxes integer DEFAULT 1;

-- Actualizar pedidos existentes (como el de Carolina Tanoue)
UPDATE orders
SET 
  quantity = CASE 
    WHEN plan = 'quarterly' THEN ROUND(total / 127900)
    ELSE ROUND(total / 44900)
  END,
  total_boxes = CASE 
    WHEN plan = 'quarterly' THEN ROUND(total / 127900) * 3
    ELSE ROUND(total / 44900)
  END,
  edition = CASE
    WHEN plan = 'quarterly' AND edition ILIKE '%Octubre%' THEN 'Octubre - Noviembre - Diciembre'
    ELSE edition
  END
WHERE quantity IS NULL OR total_boxes IS NULL OR (plan = 'quarterly' AND edition NOT LIKE '%-%');
