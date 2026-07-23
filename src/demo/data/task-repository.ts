// portfolio/demo/data/task-repository.ts — the port the service depends on
import type { Task, NewTask } from "../domain/task.ts";

export interface TaskRepository {
  list(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(input: NewTask): Promise<Task>;
  update(id: string, patch: Partial<NewTask>): Promise<Task>;
  remove(id: string): Promise<void>;
}
