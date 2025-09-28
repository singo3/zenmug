# Troubleshooting

## OpenAI API error: Invalid schema for `response_format`

If the OpenAI Responses API returns an error such as:

```
OpenAI API error: 400 Bad Request - Invalid schema for response_format 'haiku': [{'type': 'string', 'minLength': 5, 'maxLength': 5}, {'type': 'string', 'minLength': 7, 'maxLength': 7}, {'type': 'string', 'minLength': 5, 'maxLength': 5}] is not of type 'object', 'boolean'.
```

it means that the `response_format` (or `text.format` in legacy payloads) was given a `schema` value that is not a valid JSON Schema object. This typically happens when the schema is set to an array of item definitions in an attempt to enforce 5-7-5 constraints, for example:

```ts
response_format: {
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

#### 日本語での説明

OpenAI API が「有効な JSON Schema である必要がある」と言うとき、`schema` に入れる値は次のどちらかでなければなりません。

* キーとして `type` や `properties`、`items` などのキーワードを持つ **JSON オブジェクト**
* すべてを許可する `true` または何も許可しない `false` のどちらかの **真偽値**

それ以外の JSON の形（配列・文字列・数値など）を入れると「スキーマが不正」と見なされ、リクエストは 400 エラーになります。つまり、5-7-5 の制約を配列だけで表現しようとした場合のように、`schema` がオブジェクトになっていないと API 側で弾かれてしまいます。エラーはテキスト生成の失敗ではなく、リクエスト段階での形式チェックに失敗したことが原因です。

To describe an array whose elements have different constraints, wrap the rules in an object and use keywords such as [`type`], [`items`] or [`prefixItems`]:

```ts
response_format: {
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

[`type`]: https://json-schema.org/draft/2020-12/json-schema-validation#name-type
[`items`]: https://json-schema.org/draft/2020-12/json-schema-validation#name-items
[`prefixItems`]: https://json-schema.org/draft/2020-12/json-schema-validation#name-prefixitems
