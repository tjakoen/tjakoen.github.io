// local-schema-completion.ts — portfolio-owned structured requests for the browser-local WebLLM
// engine. GRAIN's shared chat adapter stays unchanged; only Builder drafts need this schema channel.

export type JsonSchema = Record<string, unknown>;

export interface SchemaCompletionEngine {
  chat: {
    completions: {
      create(request: {
        messages: { role: "user"; content: string }[];
        temperature?: number;
        response_format: { type: "json_object"; schema: string };
      }): Promise<{ choices: { message: { content: string | null } }[] }>;
    };
  };
}

/** Ask the local engine for a JSON object constrained by the supplied schema. */
export async function completeWithSchema(
  engine: SchemaCompletionEngine,
  prompt: string,
  schema: JsonSchema,
  temperature = 0.2,
): Promise<string> {
  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    temperature,
    response_format: { type: "json_object", schema: JSON.stringify(schema) },
  });
  return response.choices[0]?.message.content ?? "";
}
