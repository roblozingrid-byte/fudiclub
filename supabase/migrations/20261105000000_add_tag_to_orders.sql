-- Agregar columna de etiqueta/campaña a la tabla de órdenes (ej: Cyber Week, Black Friday)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tag text;
