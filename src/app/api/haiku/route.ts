import { NextResponse } from "next/server";
import { englishToHaiku } from "@/lib/haiku";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const haiku = await englishToHaiku(text);
    return NextResponse.json({ haiku });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
