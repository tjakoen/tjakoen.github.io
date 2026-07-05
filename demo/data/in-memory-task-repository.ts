// portfolio/demo/data/in-memory-task-repository.ts — wired-in placeholder, zero deps
import type { Task, NewTask } from "../domain/task.ts";
import type { TaskRepository } from "./task-repository.ts";

export class InMemoryTaskRepository implements TaskRepository {
  private rows = new Map<string, Task>();
  private seq = 0;
  constructor(seed: Task[] = []) { for (const r of seed) this.rows.set(r.id, r); }

  async list() { return [...this.rows.values()].sort((a, b) => +b.createdAt - +a.createdAt); }
  async findById(id: string) { return this.rows.get(id) ?? null; }
  async create(input: NewTask) {
    const now = new Date();
    const task: Task = { ...input, id: `ITM-${++this.seq}`, createdAt: now, updatedAt: now };
    this.rows.set(task.id, task);
    return task;
  }
  async update(id: string, patch: Partial<NewTask>) {
    const cur = this.rows.get(id);
    if (!cur) throw new Error("Task not found");
    const next = { ...cur, ...patch, updatedAt: new Date() };
    this.rows.set(id, next);
    return next;
  }
  async remove(id: string) { this.rows.delete(id); }
}
