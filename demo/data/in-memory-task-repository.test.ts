import { expect, test } from "bun:test";
import { InMemoryTaskRepository } from "./in-memory-task-repository.ts";

test("create + partial update preserves untouched fields", async () => {
  const repo = new InMemoryTaskRepository();
  const a = await repo.create({ name: "First", description: "alpha", status: "active" });
  const updated = await repo.update(a.id, { status: "archived" });
  expect(updated.status).toBe("archived");
  expect(updated.name).toBe("First");          // untouched fields kept
  expect(await repo.findById("nope")).toBeNull();
});
