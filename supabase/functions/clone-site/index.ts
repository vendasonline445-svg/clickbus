import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractHtmlFromResponse(raw: string): string {
  // Try ```html code block first
  const htmlBlock = raw.match(/```html\s*\n?([\s\S]*?)```/);
  if (htmlBlock) return htmlBlock[1].trim();

  // Try any code block
  const anyBlock = raw.match(/```\s*\n?([\s\S]*?)```/);
  if (anyBlock && anyBlock[1].includes('<!DOCTYPE') || anyBlock && anyBlock[1].includes('<html')) {
    return anyBlock[1].trim();
  }

  // Try raw HTML in the response
  const doctypeMatch = raw.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (doctypeMatch) return doctypeMatch[1].trim();

  // Try from <html> tag
  const htmlTagMatch = raw.match(/(<html[\s\S]*<\/html>)/i);
  if (htmlTagMatch) return htmlTagMatch[1].trim();

  // Return as-is if it looks like HTML
  if (raw.trim().startsWith('<')) return raw.trim();

  return raw;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceHtml, url, screenshotBase64, additionalScreenshots } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Collect all screenshots
    const allScreenshots: string[] = [];
    if (screenshotBase64) allScreenshots.push(screenshotBase64);
    if (Array.isArray(additionalScreenshots)) {
      allScreenshots.push(...additionalScreenshots);
    }

    const systemPrompt = `You are an expert web developer. Your ONLY job is to output a COMPLETE, standalone HTML file that visually clones a website.

CRITICAL RULES:
- Output ONLY the HTML code. No explanations, no markdown, no code fences.
- Start with <!DOCTYPE html> and end with </html>
- ALL CSS must be in a <style> tag inside <head>
- Convert relative URLs to absolute using base: ${url}
- Keep all images using absolute URLs from the original site
- Preserve exact colors, fonts, spacing, layout, shadows, gradients
- Preserve responsive design with media queries
- Remove tracking scripts, analytics, third-party JS
- Include Google Fonts <link> tags if the site uses custom fonts
- Make it look IDENTICAL to the original
- If you have screenshots, use ALL of them to understand different sections/pages of the site and combine them into one cohesive clone
- Screenshots may show different parts of the same page (scrolled sections) — reconstruct the full page`;

    const messages: any[] = [{ role: "system", content: systemPrompt }];

    const userContent: any[] = [];

    if (allScreenshots.length > 0) {
      // Add all screenshots as separate image entries
      for (let i = 0; i < allScreenshots.length; i++) {
        userContent.push({
          type: "image_url",
          image_url: { url: `data:image/png;base64,${allScreenshots[i]}` }
        });
      }
      userContent.push({
        type: "text",
        text: `${allScreenshots.length} screenshot(s) of ${url}. Use ALL images to reconstruct the complete site. ${sourceHtml ? `Source HTML (first 50000 chars):\n${sourceHtml.substring(0, 50000)}` : 'No HTML available — reconstruct entirely from the screenshots.'}`
      });
    } else {
      userContent.push({
        type: "text",
        text: `Clone this website: ${url}\n\nSource HTML (first 50000 chars):\n${sourceHtml?.substring(0, 50000) || 'Could not fetch HTML.'}`
      });
    }

    messages.push({ role: "user", content: userContent });

    console.log("Calling AI gateway for clone...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 32000,
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit — tente novamente em 1 minuto" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI failed to generate clone" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response length:", rawContent.length);
    
    const clonedHtml = extractHtmlFromResponse(rawContent);
    
    console.log("Extracted HTML length:", clonedHtml.length, "starts with:", clonedHtml.substring(0, 50));

    return new Response(JSON.stringify({ html: clonedHtml }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Clone error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
