import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json().catch(() => ({}));
    const t =
      typeof topic === "string" && topic.trim()
        ? topic.slice(0, 120)
        : "nature";

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Write a 3-line haiku in English about ${t}.`,
        max_output_tokens: 80,
        temperature: 0.8,
      }),
    });

    const text = await r.text();
    if (!r.ok) {
      return new Response(text, { status: r.status });
    }

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return new Response(message, { status: 500 });
  }
}
