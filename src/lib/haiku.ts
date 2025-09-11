export interface HaikuResult {
  ja: string[];
  en: string[];
}

export async function englishToHaiku(text: string): Promise<HaikuResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key");
  }
  const project = process.env.OPENAI_PROJECT;
  if (!project) {
    throw new Error("Missing OpenAI project ID");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Project": project,
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
              ja: { type: "array", items: { type: "string" } },
              en: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      input: [
        {
          role: "system",
          content:
            "You turn English text into a Japanese haiku in 5-7-5 syllables and provide an English translation for each line. Respond strictly with JSON having keys 'ja' and 'en' as arrays.",
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
  return {
    ja: Array.isArray(json.ja) ? (json.ja as string[]) : [],
    en: Array.isArray(json.en) ? (json.en as string[]) : [],
  };
}

function countSyllablesWord(word: string): number {
  let w = word.toLowerCase();
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/u, "");
  w = w.replace(/^y/u, "");
  const matches = w.match(/[aeiouy]{1,2}/gu);
  return matches ? matches.length : 1;
}

export function countSyllables(line: string): number {
  return line
    .split(/\s+/u)
    .filter(Boolean)
    .map(countSyllablesWord)
    .reduce((a, b) => a + b, 0);
}
