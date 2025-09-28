# Troubleshooting

## OpenAI API error: Unsupported parameter `response_format`

If you receive an error such as:

```
OpenAI API error: 400 Bad Request - Unsupported parameter: 'response_format'. In the Responses API, this parameter has moved to 'text.format'.
```

update your request payload to place the JSON Schema options under the [`text.format` field](https://platform.openai.com/docs/api-reference/responses/create#responses-create-text).

```ts
text: {
  format: "json_schema",
  json_schema: {
    name: "haiku",
    schema: { /* ... */ },
  },
},
```

Older payloads used the `response_format` key, but that parameter has been removed from the Responses API. After migrating to `text.format`, the rest of this guide about supplying a valid JSON Schema still applies.

## OpenAI API error: Invalid schema for `response_format`

If the OpenAI Responses API returns an error such as:

```
OpenAI API error: 400 Bad Request - Invalid schema for response_format 'haiku': [{'type': 'string', 'minLength': 5, 'maxLength': 5}, {'type': 'string', 'minLength': 7, 'maxLength': 7}, {'type': 'string', 'minLength': 5, 'maxLength': 5}] is not of type 'object', 'boolean'.
```

it means that the `text.format` (formerly `response_format`) value was given a `schema` that is not a valid JSON Schema object. This typically happens when the schema is set to an array of item definitions in an attempt to enforce 5-7-5 constraints, for example:

```ts
text: {
  type: "json_schema",
  json_schema: {
    name: "haiku",
    schema: [
      { type: "string", minLength: 5, maxLength: 5 },
      { type: "string", minLength: 7, maxLength: 7 },
      { type: "string", minLength: 5, maxLength: 5 },
    ],
  },
}
```

### What does “valid JSON Schema” mean?

When the OpenAI API says that the value must be “a valid JSON Schema,” it is referring to the [IETF JSON Schema specification](https://json-schema.org/). Under that specification, every schema is either:

* a JSON **object** whose keys are vocabulary keywords such as `type`, `properties`, `items`, etc., or
* one of the literal booleans `true` (accept anything) / `false` (accept nothing).

Any other JSON type—arrays, strings, numbers—violates the JSON Schema format rules and therefore triggers the error. In other words, the value assigned to `schema` must be an **object** (or `true`/`false`). The Responses API validates this before it ever generates text, so the error is **not** caused by the model failing to produce 5-7-5 lines—the request is rejected because the schema is malformed.

### Why it “used to work” earlier in the day

When no schema (or an always-true schema) is supplied, the model can return any text. In that situation the request succeeds, but the generated haiku is not guaranteed to respect the 5-7-5 pattern—hence the earlier non-5-7-5 output. After updating the request to add the strict schema above, the API now validates the payload before generation. Because the schema is expressed as an **array** instead of an **object**, the request is rejected at validation time and returns the `Invalid schema` error. In short: the first request passed because there was no schema enforcement, whereas the new request fails before generation because the schema format is invalid.

#### 日本語での説明

OpenAI API が「有効な JSON Schema である必要がある」と言うとき、`schema` に入れる値は次のどちらかでなければなりません。

* キーとして `type` や `properties`、`items` などのキーワードを持つ **JSON オブジェクト**
* すべてを許可する `true` または何も許可しない `false` のどちらかの **真偽値**

それ以外の JSON の形（配列・文字列・数値など）を入れると「スキーマが不正」と見なされ、リクエストは 400 エラーになります。つまり、5-7-5 の制約を配列だけで表現しようとした場合のように、`schema` がオブジェクトになっていないと API 側で弾かれてしまいます。エラーはテキスト生成の失敗ではなく、リクエスト段階での形式チェックに失敗したことが原因です。

#### なぜ「午前中は動いた」のか？

スキーマを設定していなかった（あるいは常に `true` を返す緩いスキーマだった）場合、モデルは任意の文章を返せるためリクエストは成功します。ただし 5-7-5 の保証がないため、最初に生成された俳句が 5-7-5 でなかったのはこのためです。その後、5-7-5 を厳密に強制しようとして上記のような配列のスキーマを追加すると、OpenAI 側のバリデーションで「配列は JSON Schema として無効」と判断され、生成処理に入る前に 400 エラーが返されるようになります。つまり、以前はスキーマ検証が行われていなかったため動作し、現在は不正なスキーマが原因でエラーになっているという違いです。

To describe an array whose elements have different constraints, wrap the rules in an object and use keywords such as [`type`], [`items`] or [`prefixItems`]:

```ts
text: {
  type: "json_schema",
  json_schema: {
    name: "haiku",
    schema: {
      type: "object",
      required: ["ja", "en"],
      properties: {
        ja: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          prefixItems: [
            { type: "string", minLength: 5, maxLength: 5 },
            { type: "string", minLength: 7, maxLength: 7 },
            { type: "string", minLength: 5, maxLength: 5 },
          ],
        },
        en: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
  },
}
```

With the schema expressed as an object, the request satisfies the API's validation rules and the error disappears.

### A looser schema that avoids errors

If you only need the model to return three text lines—without strictly enforcing the 5-7-5 syllable counts—you can keep the schema even simpler. The following schema accepts any three strings, so it never triggers the validation error while still providing a predictable structure in the response:

```ts
text: {
  type: "json_schema",
  json_schema: {
    name: "haiku",
    schema: {
      type: "object",
      required: ["lines"],
      properties: {
        lines: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
  },
}
```

Because the schema is an object, it remains valid JSON Schema. At the same time it deliberately omits any `minLength`/`maxLength` constraints, so the API does not reject the request even if the generated lines fail to follow 5-7-5. This lets you keep a structured response while avoiding the `Invalid schema` error entirely.

#### 緩いスキーマでエラーを防ぐには？

5-7-5 の音節制約まで厳密にチェックしたい場合は上記のように `prefixItems` を使って条件を書く必要がありますが、単に「3 行のテキストを返してほしい」だけならもっと緩いスキーマでも十分です。例えば次のように、`lines` プロパティが文字列の配列であることだけを指定します。

```ts
text: {
  type: "json_schema",
  json_schema: {
    name: "haiku",
    schema: {
      type: "object",
      required: ["lines"],
      properties: {
        lines: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
  },
}
```

このスキーマは JSON Schema のルールを満たしているため 400 エラーにはなりません。一方で `minLength` や `maxLength` を設定していないので、生成された文字列が 5-7-5 でなくても API 側で弾かれることはありません。構造だけをゆるやかに決めておきたいときに便利な設定です。

[`type`]: https://json-schema.org/draft/2020-12/json-schema-validation#name-type
[`items`]: https://json-schema.org/draft/2020-12/json-schema-validation#name-items
[`prefixItems`]: https://json-schema.org/draft/2020-12/json-schema-validation#name-prefixitems
