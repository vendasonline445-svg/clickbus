import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================================
// 🔑 CREDENCIAIS PIX — SYNCPAYMENTS
// Altere abaixo com suas credenciais do SyncPayments
// ============================================================
const PIX_CLIENT_ID = "SUA_CLIENT_ID_AQUI";
const PIX_CLIENT_SECRET = "SUA_CLIENT_SECRET_AQUI";
// ============================================================

const SYNC_BASE = "https://api.syncpayments.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cache token in memory (edge function instance)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    return cachedToken.token;
  }

  const res = await fetch(`${SYNC_BASE}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("SyncPayments auth error:", res.status, errText);
    throw new Error(`Falha na autenticação SyncPayments: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: new Date(data.expires_at).getTime(),
  };
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, description, client } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor (amount) inválido. Deve ser um número positivo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PIX_CLIENT_ID || PIX_CLIENT_ID === "SUA_CLIENT_ID_AQUI" || !PIX_CLIENT_SECRET || PIX_CLIENT_SECRET === "SUA_CLIENT_SECRET_AQUI") {
      return new Response(
        JSON.stringify({ error: "Credenciais PIX não configuradas. Edite o arquivo generate-pix/index.ts com suas credenciais SyncPayments." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth token
    const token = await getAuthToken(PIX_CLIENT_ID, PIX_CLIENT_SECRET);

    // Create PIX cash-in
    const cashInBody: Record<string, unknown> = {
      amount,
      description: description || "Pagamento via PIX",
    };

    if (client && typeof client === "object") {
      cashInBody.client = {
        name: client.name || "Cliente",
        cpf: client.cpf || "00000000000",
        email: client.email || "cliente@email.com",
        phone: client.phone || "00000000000",
      };
    }

    console.log("Creating PIX cash-in:", JSON.stringify(cashInBody));

    const pixRes = await fetch(`${SYNC_BASE}/api/partner/v1/cash-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cashInBody),
    });

    if (!pixRes.ok) {
      const errText = await pixRes.text();
      console.error("SyncPayments cash-in error:", pixRes.status, errText);

      if (pixRes.status === 401 && cachedToken) {
        cachedToken = null;
        const newToken = await getAuthToken(PIX_CLIENT_ID, PIX_CLIENT_SECRET);
        const retryRes = await fetch(`${SYNC_BASE}/api/partner/v1/cash-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify(cashInBody),
        });

        if (!retryRes.ok) {
          const retryErr = await retryRes.text();
          console.error("SyncPayments retry error:", retryRes.status, retryErr);
          return new Response(
            JSON.stringify({ error: `Erro SyncPayments: ${retryRes.status} - ${retryErr}` }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const retryData = await retryRes.json();
        return new Response(
          JSON.stringify({
            pix_code: retryData.pix_code,
            identifier: retryData.identifier,
            message: retryData.message,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Erro SyncPayments: ${pixRes.status} - ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pixData = await pixRes.json();
    console.log("PIX created successfully:", pixData.identifier);

    return new Response(
      JSON.stringify({
        pix_code: pixData.pix_code,
        identifier: pixData.identifier,
        message: pixData.message,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate PIX error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno ao gerar PIX" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
