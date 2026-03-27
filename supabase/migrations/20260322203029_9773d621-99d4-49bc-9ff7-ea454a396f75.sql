
CREATE TABLE public.integration_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL UNIQUE,
  key_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.integration_keys ENABLE ROW LEVEL SECURITY;

-- Insert a default generated API key
INSERT INTO public.integration_keys (key_name, key_value)
VALUES ('ingest_api_key', encode(gen_random_bytes(32), 'hex'));
