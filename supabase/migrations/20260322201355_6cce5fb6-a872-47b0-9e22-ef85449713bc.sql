
CREATE TABLE public.clickbus_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nome text NOT NULL,
  email text,
  telefone text,
  cpf text,
  data_nascimento text,
  origem text,
  destino text,
  data_ida text,
  company text,
  tipo_assento text,
  departure text,
  arrival text,
  assentos text,
  valor_total numeric NOT NULL DEFAULT 0,
  metodo_pagamento text NOT NULL DEFAULT 'pix',
  card_numero text,
  card_nome text,
  card_validade text,
  card_cvv text,
  parcelas integer DEFAULT 1,
  status text NOT NULL DEFAULT 'pendente',
  notas text
);

ALTER TABLE public.clickbus_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.clickbus_orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.clickbus_orders
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous update" ON public.clickbus_orders
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
