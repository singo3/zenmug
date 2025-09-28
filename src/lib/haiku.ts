export interface HaikuResult {
  ja: string[];
  en: string[];
}

export async function englishToHaiku(
  text: string,
  attempt = 1,
): Promise<HaikuResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_output_tokens: 300,
      text: {
        format: {
          type: "json_schema",
          name: "haiku",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["ja", "en"],
            properties: {
              ja: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: [
                  { type: "string", minLength: 5, maxLength: 5 },
                  { type: "string", minLength: 7, maxLength: 7 },
                  { type: "string", minLength: 5, maxLength: 5 },
                ],
                additionalItems: false,
              },
              en: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
              },
            },
          },
        },
      },
      input: [
        {
          role: "system",
          content: [
            "You transform English input into a Japanese haiku.",
            "Return strict JSON with keys 'ja' and 'en'.",
            "'ja' must be an array of exactly three Japanese strings.",
            "Line one must contain exactly 5 characters, line two 7 characters, and line three 5 characters—counting literal characters, not syllables.",
            "Do not include punctuation, spaces, or ruby/furigana in the Japanese lines.",
            "'en' must be an array of natural English translations, one per line in the same order.",
          ].join(" "),
        },
        { role: "user", content: `Text: ${text}` },
      ],
    }),
  });

  if (!res.ok) {
    let message = `OpenAI API error: ${res.status} ${res.statusText}`;
    try {
      const err = await res.json();
      const apiMessage = err?.error?.message;
      if (apiMessage) {
        message += ` - ${apiMessage}`;
      }
    } catch {
      // ignore JSON parse errors from error responses
    }
    throw new Error(message);
  }

  const data = await res.json();
  const content =
    data.output?.[0]?.content?.[0]?.text ?? data.output_text ?? undefined;
  if (!content) {
    throw new Error("Invalid OpenAI response format");
  }
  let json: { ja?: unknown; en?: unknown };
  try {
    json = JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON in OpenAI response");
  }
  const ja = Array.isArray(json.ja) ? (json.ja as string[]) : [];
  const en = Array.isArray(json.en) ? (json.en as string[]) : [];

  if (!isValidHaiku(ja)) {
    if (attempt < 3) {
      return englishToHaiku(text, attempt + 1);
    }
    throw new Error("Generated haiku does not follow the 5-7-5 character pattern");
  }

  return { ja, en };
}

function isValidHaiku(lines: string[]): boolean {
  if (lines.length !== 3) return false;
  const [first, second, third] = lines;
  return first.length === 5 && second.length === 7 && third.length === 5;
}
