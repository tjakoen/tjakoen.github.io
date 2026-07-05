// portfolio/demo/services/task-service.ts
import type { Task } from "../domain/task.ts";
import type { TaskRepository } from "../data/task-repository.ts";

export class TaskService {
  private tasks: TaskRepository;
  constructor(tasks: TaskRepository) { this.tasks = tasks; }   // explicit field (erasable)

  // domain-returning
  listTasks(): Promise<Task[]> { return this.tasks.list(); }
  getTask(id: string): Promise<Task | null> { return this.tasks.findById(id); }
  createTask(name: string, description: string): Promise<Task> {
    return this.tasks.create({ name, description, status: "active" });
  }
  archiveTask(id: string): Promise<Task> { return this.tasks.update(id, { status: "archived" }); }
  deleteTask(id: string): Promise<void> { return this.tasks.remove(id); }
}
