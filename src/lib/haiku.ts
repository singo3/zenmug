export interface HaikuResult {
  ja: string[];
  en: string[];
}

export async function englishToHaiku(text: string): Promise<HaikuResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      input: `Convert the following English text into a traditional Japanese haiku in 5-7-5 syllables and provide the English translation for each line. Return JSON with keys 'ja' and 'en' as arrays.\n\nText: ${text}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const outputText = data.output_text || data.output?.[0]?.content?.[0]?.text || "{}";
  const json = JSON.parse(outputText);
  return {
    ja: json.ja ?? [],
    en: json.en ?? [],
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
