-- Crear tabla de clientes
CREATE TABLE customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  address text,
  cp text,
  allergies text,
  marketing_opt_in boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Crear tabla de órdenes
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES customers(id),
  status text NOT NULL DEFAULT 'pending',
  plan text NOT NULL,
  payment_method text NOT NULL,
  total integer NOT NULL,
  mercadopago_preference_id text,
  mercadopago_payment_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla de lista de espera
CREATE TABLE waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
