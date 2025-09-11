export const runtime = "nodejs";
export async function GET() {
  return Response.json({
    hasKey: !!process.env.OPENAI_API_KEY,
    env: process.env.VERCEL_ENV || "unknown",
  });
}
