export const runtime = "nodejs";
export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return new Response("no key", { status: 500 });

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", input: "Say 'pong'.", max_output_tokens: 8 }),
  });
  const txt = await r.text();
  return new Response(txt, { status: r.status, headers: { "Content-Type": "application/json" } });
}
