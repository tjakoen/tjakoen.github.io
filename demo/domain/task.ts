// portfolio/demo/domain/task.ts — models, ZERO dependencies
export interface Task {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";   // union, not enum (erasable)
  createdAt: Date;
  updatedAt: Date;
}

// Input for creation — the fields a caller supplies.
export type NewTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
