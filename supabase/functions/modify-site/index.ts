import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractHtmlFromResponse(raw: string): string {
  const htmlBlock = raw.match(/```html\s*\n?([\s\S]*?)```/);
  if (htmlBlock) return htmlBlock[1].trim();

  const anyBlock = raw.match(/```\s*\n?([\s\S]*?)```/);
  if (anyBlock && (anyBlock[1].includes('<!DOCTYPE') || anyBlock[1].includes('<html'))) {
    return anyBlock[1].trim();
  }

  const doctypeMatch = raw.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (doctypeMatch) return doctypeMatch[1].trim();

  const htmlTagMatch = raw.match(/(<html[\s\S]*<\/html>)/i);
  if (htmlTagMatch) return htmlTagMatch[1].trim();

  if (raw.trim().startsWith('<')) return raw.trim();
  return raw;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { html, instruction, mode, history, images, checkout } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const looksLikePixIssue = typeof instruction === "string" && /(pix|checkout|gateway|pagamento|payment|api)/i.test(instruction);
    let systemPrompt = "";

    if (mode === "inject_checkout") {
      systemPrompt = `You are an expert web developer specializing in payment integration.
You receive an HTML page and a JSON config with edgeFunctionUrl and supabaseAnonKey.
Your job is to inject a PIX checkout flow.

CRITICAL: The PIX generation MUST call the edge function, NOT the gateway directly.

When a purchase button is clicked:
1. Show a modal with a form asking: Nome, CPF, Email, Telefone, and the product price
2. On form submit, call the edge function like this:

fetch(config.edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + config.supabaseAnonKey,
    'apikey': config.supabaseAnonKey
  },
  body: JSON.stringify({
    amount: productPrice,
    description: 'Compra - ' + productName,
    client: { name, cpf, email, phone }
  })
})

3. The response will have { pix_code, identifier, message }
4. Show the pix_code as a copiable text (copia e cola PIX)
5. Generate a QR code from pix_code using a canvas-based QR generator (inline, no external libs — implement a minimal QR encoder or use a simple <img> tag pointing to a QR API like https://api.qrserver.com/v1/create-qr-code/?data=PIX_CODE&size=200x200)
6. Show a countdown timer (e.g. 30 minutes)
7. Add a "Copiar código PIX" button that copies pix_code to clipboard

RULES:
- Output ONLY the complete modified HTML (<!DOCTYPE to </html>)
- Keep ALL existing visual design intact
- The edge function URL and anonKey come from the instruction JSON — extract them and use them exactly
- Make the PIX modal match the site design
- Add error handling: show a visible error message if the fetch fails
- NEVER call the SyncPayments API directly from the browser
- All JS self-contained, no external dependencies except the QR image API`;
    } else {
      systemPrompt = looksLikePixIssue
        ? `You are a SENIOR full-stack web developer specialized in diagnosing and fixing checkout, PIX, payment gateway, and frontend integration bugs.
You receive a COMPLETE HTML page, a user instruction, prior change history, previous failure feedback, and optionally checkout configuration.
Your ONLY job is to fix the requested issue and return the FULL modified HTML.

CRITICAL RULES:
1. Output ONLY the complete modified HTML starting with <!DOCTYPE html> and ending with </html>
2. Do NOT wrap your output in markdown code blocks
3. Do NOT add any explanation text before or after the HTML
4. PRESERVE every single element, style, script, and structure that was NOT mentioned in the instruction
5. When the issue is about PIX, gateway, checkout, or API errors, inspect the existing JavaScript and repair the actual request flow instead of making cosmetic edits
6. If checkout configuration is provided, use the EXACT gateway API URL and public key values supplied in context
7. Never invent placeholder API URLs, fake credentials, or pseudo-code. The returned HTML must contain executable code
8. Keep secrets out of client-side code. If only a public key is available on the client, use only the public key in browser requests
9. If the current implementation does not call the configured gateway URL, correct it so fetch/XHR uses that exact URL
10. Add concise runtime error handling in the page JavaScript so failed PIX generation surfaces a visible message instead of silently failing
11. If previous failures are provided, treat them as mandatory correction orders: identify exactly why the previous attempt failed and fix that specific mistake in the next HTML
12. If the feedback says the API was not called, the final HTML must contain a real fetch/XHR request to the configured gatewayApiUrl triggered by the PIX action
13. If the feedback says the PIX modal opens but QR/code is empty, map the real API response fields into the modal and keep the visible fallback message only for true runtime failures
14. All CSS must remain inline in <style> tags
15. All JS must remain in <script> tags
16. NEVER remove or break existing functionality
17. Maintain responsive design and current visual identity

You are fixing a real payment issue. Be concrete, technical, and precise.`
        : `You are a SENIOR full-stack web developer and designer with 15+ years of experience.
You receive a COMPLETE HTML page and an improvement instruction from the user.
Your ONLY job is to apply the requested modification and return the FULL modified HTML.

CRITICAL RULES:
1. Output ONLY the complete modified HTML starting with <!DOCTYPE html> and ending with </html>
2. Do NOT wrap your output in markdown code blocks
3. Do NOT add any explanation text before or after the HTML
4. PRESERVE every single element, style, script, and structure that was NOT mentioned in the instruction
5. Apply changes PRECISELY as described - if they say "change button color to green", change ONLY the button color
6. All CSS must remain inline in <style> tags
7. All JS must remain in <script> tags
8. Make changes look PROFESSIONAL - use proper spacing, colors, typography
9. If the instruction is about adding something (countdown, section, popup), integrate it seamlessly into the existing design
10. NEVER remove or break existing functionality
11. If the instruction mentions colors, use exact hex/rgb values when provided
12. For layout changes, maintain responsive design patterns already in place

You are modifying a LIVE landing page. Quality matters. Every pixel matters.`;
    }

    // Build messages with history context
    const messages: Array<{role: string; content: string}> = [
      { role: "system", content: systemPrompt },
    ];

    // Add history and failure feedback so AI understands both what worked and what failed
    if (history && Array.isArray(history) && history.length > 0) {
      const successfulHistory = history.filter((h: { success?: boolean }) => h.success !== false);
      const failedHistory = history.filter((h: { success?: boolean }) => h.success === false);

      if (successfulHistory.length > 0) {
        const historyContext = successfulHistory
          .map((h: {instruction: string; timestamp: string; mode?: string}, i: number) => `${i + 1}. [${h.mode || 'improve'}] "${h.instruction}"`)
          .join('\n');

        messages.push({
          role: "user",
          content: `CONTEXT: The following modifications were already applied to this page (in order):\n${historyContext}\n\nKeep all these previous changes intact while applying the new one.`
        });
        messages.push({
          role: "assistant",
          content: "Understood. I will preserve all previous modifications and apply the new change on top of them."
        });
      }

      if (failedHistory.length > 0) {
        const failureContext = failedHistory
          .slice(-5)
          .map((h: { instruction: string; error?: string; mode?: string }, i: number) => `${i + 1}. [${h.mode || 'improve'}] Request: "${h.instruction}"\n   Failure feedback: ${h.error || 'Unknown failure'}`)
          .join('\n');

        messages.push({
          role: "user",
          content: `MANDATORY FAILURE FEEDBACK FROM PREVIOUS ATTEMPTS:\n${failureContext}\n\nYou previously failed. Do not repeat those mistakes. Use this feedback as direct correction orders for the next HTML you return.`
        });
        messages.push({
          role: "assistant",
          content: "Understood. I will explicitly correct the previously reported mistakes instead of repeating them."
        });
      }
    }

    if (checkout && typeof checkout === "object") {
      const checkoutContext = {
        gatewayApiUrl: checkout.gatewayApiUrl || "",
        gatewayPublicKey: checkout.gatewayPublicKey || "",
        gatewaySecretKeyConfigured: !!checkout.gatewaySecretKeyConfigured,
        pixEnabled: !!checkout.pixEnabled,
      };

      messages.push({
        role: "user",
        content: `CHECKOUT CONFIGURATION AVAILABLE FOR THIS PAGE:\n${JSON.stringify(checkoutContext, null, 2)}\n\nIf the request is about PIX, checkout, payment, gateway, or API failures, you MUST use this configuration as the source of truth. If gatewayApiUrl is present, the final HTML must call that exact URL instead of any invented or old endpoint.`
      });
      messages.push({
        role: "assistant",
        content: "Understood. I will use the provided checkout configuration as the source of truth for payment-related fixes and ensure the configured gateway URL is actually called."
      });
    }

    // Build user message content (text + optional images)
    const userContent: any[] = [];
    
    const textPrompt = mode === "inject_checkout"
      ? `Here is the HTML page. Analyze it and inject PIX checkout functionality into all purchase/buy buttons and CTAs.\n\nGateway config: ${instruction}\n\nHTML:\n${html.substring(0, 80000)}`
      : looksLikePixIssue
        ? `Fix this PIX/payment/gateway problem in the HTML page. Be precise and technical. Audit the current HTML/CSS/JS, identify why the checkout flow is failing, and return the corrected full HTML.\n\nUSER REQUEST: ${instruction}\n\nCURRENT HTML:\n${html.substring(0, 80000)}`
        : `Apply this exact modification to the HTML page. Be precise and thorough:\n\nMODIFICATION: ${instruction}\n\nCURRENT HTML:\n${html.substring(0, 80000)}`;
    
    userContent.push({ type: "text", text: textPrompt });

    // Add images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.base64 && img.mimeType) {
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:${img.mimeType};base64,${img.base64}`,
            },
          });
        }
      }
      console.log(`Attached ${images.length} image(s) to the request`);
    }

    messages.push({ role: "user", content: userContent });

    console.log(`Modify-site mode: ${mode}, instruction: "${instruction?.substring(0, 100)}", history: ${history?.length || 0} items`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 100000,
        temperature: 0.05,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit — tente novamente em 1 minuto" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI failed: " + aiResponse.status }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    const modifiedHtml = extractHtmlFromResponse(rawContent);

    console.log("Modified HTML length:", modifiedHtml.length, "raw length:", rawContent.length);

    if (modifiedHtml.length < 100) {
      console.error("HTML too short, raw response:", rawContent.substring(0, 500));
      return new Response(JSON.stringify({ error: "IA retornou HTML vazio ou inválido. Tente reformular o pedido." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ html: modifiedHtml }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Modify error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
