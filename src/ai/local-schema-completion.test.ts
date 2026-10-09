import { describe, expect, test } from "bun:test";
import { completeWithSchema, type SchemaCompletionEngine } from "./local-schema-completion.ts";

describe("portfolio-local schema completion", () => {
  test("sends the visitor brief and JSON schema to the local OpenAI-shaped engine", async () => {
    let captured: unknown;
    const engine: SchemaCompletionEngine = {
      chat: { completions: { create: async (request) => {
        captured = request;
        return { choices: [{ message: { content: '{"blocks":[{"name":"lede"}]}' } }] };
      } } },
    };
    const schema = { type: "object", properties: { blocks: { type: "array" } } };

    const result = await completeWithSchema(engine, "An intro about sourdough.", schema);

    expect(result).toBe('{"blocks":[{"name":"lede"}]}');
    expect(captured).toEqual({
      messages: [{ role: "user", content: "An intro about sourdough." }],
      temperature: 0.2,
      response_format: { type: "json_object", schema: JSON.stringify(schema) },
    });
  });

  test("returns an empty answer when the engine supplies no content", async () => {
    const engine: SchemaCompletionEngine = {
      chat: { completions: { create: async () => ({ choices: [{ message: { content: null } }] }) } },
    };
    expect(await completeWithSchema(engine, "brief", { type: "object" })).toBe("");
  });
});
