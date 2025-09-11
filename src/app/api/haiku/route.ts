import { NextRequest } from "next/server";

// 重要: まずは Node ランタイムで安定させる
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 入力の健全化
    const json = (await req.json().catch(() => ({}))) as { topic?: unknown };
    const topic =
      typeof json.topic === "string" && json.topic.trim()
        ? json.topic.slice(0, 120)
        : "nature";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY missing");
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    // Responses API に統一（input + max_output_tokens）
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Write a 3-line haiku in English about ${topic}.`,
        max_output_tokens: 80,
        temperature: 0.8,
      }),
    });

    const raw = await upstream.text(); // まずは生テキストで可視化
    const ct = upstream.headers.get("content-type") || "text/plain";

    // 上流のステータスをそのまま返す（400のときは本文に理由が入ってる）
    return new Response(raw, {
      status: upstream.status,
      headers: { "Content-Type": ct.includes("json") ? "application/json" : "text/plain" },
    });
  } catch (err: unknown) {
    console.error("haiku route crashed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Route crashed: ${message}`, { status: 500 });
  }
}
