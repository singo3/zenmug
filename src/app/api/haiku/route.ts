import { NextResponse } from "next/server";
import { englishToHaiku } from "@/lib/haiku";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 200) {
      return NextResponse.json(
        { error: "Invalid text" },
        { status: 400 },
      );
    }
    const haiku = await englishToHaiku(text);
    return NextResponse.json({ haiku });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes("OpenAI API error") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
