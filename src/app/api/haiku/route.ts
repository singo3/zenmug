import { NextRequest } from "next/server";

// Use Node runtime for stable server-side fetch
export const runtime = "nodejs";

/**
 * POST /api/haiku
 * Expects: { text: string }
 * Returns: { haiku: { ja: string[]; en: string[] } }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and sanitize input
    const json = (await req.json().catch(() => ({}))) as { text?: unknown };
    const text =
      typeof json.text === "string" && json.text.trim()
        ? json.text.slice(0, 200)
        : "nature";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY missing");
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Call OpenAI Responses API and ask for structured JSON output
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Generate a 3-line haiku in Japanese (5-7-5) about: ${text}\nProvide an English translation. Return JSON with keys 'ja' and 'en' (arrays of three strings).`,
        max_output_tokens: 120,
        temperature: 0.7,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "haiku_schema",
            strict: true,
            schema: {
              type: "object",
              properties: {
                ja: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
                en: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["ja", "en"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!upstream.ok) {
      const errTxt = await upstream.text();
      return new Response(JSON.stringify({ error: errTxt || "OpenAI request failed" }), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await upstream.json();
    const content = data.output?.[0]?.content?.[0]?.text;
    let haiku = null;
    if (typeof content === "string") {
      try {
        haiku = JSON.parse(content);
      } catch {
        // fallback: treat whole text as single string lines
        haiku = { ja: [], en: [] };
      }
    }

    return new Response(JSON.stringify({ haiku }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("haiku route crashed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
