import { NextRequest } from "next/server";
import { englishToHaiku } from "@/lib/haiku";

// Use Node runtime for stable server-side fetch
export const runtime = "nodejs";

/**
 * POST /api/haiku
 * Expects: { text: string }
 * Returns: { ja: string[]; en: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and sanitize input
    const json = (await req.json().catch(() => ({}))) as { text?: unknown };
    const text =
      typeof json.text === "string" && json.text.trim()
        ? json.text.slice(0, 200)
        : "nature";

    const haiku = await englishToHaiku(text);

    return new Response(JSON.stringify(haiku), {
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
