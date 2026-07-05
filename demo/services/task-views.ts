// portfolio/demo/services/task-views.ts — view models live with the app layer
import type { Task } from "../domain/task.ts";
import { surface, type ActionName, type Surface } from "../../../grain/ai/contract.ts";

// View for the AI-loop demo card (docs/AI-INTERFACE.md §7). Carries its SURFACE
// address and an action verb; `commit` is always "committed" server-side — the
// client stamps "pending" (grain) optimistically, the confirmed re-render is clean.
// NB: the grain surface KIND stays "item" (the contract vocabulary — a generic
// list item); only the demo's own domain type renamed to Task.
export interface LoopCardView {
  surface: Surface;                          // surface("item", id)
  commit: "committed";
  name: string;
  status: { label: string };
  action: { name: ActionName | ""; label: string };   // typed verb; "" → inert (no data-action)
}

export const toLoopCardView = (task: Task): LoopCardView => ({
  surface: surface("item", task.id),
  commit: "committed",
  name: task.name,
  status: { label: task.status === "active" ? "Active" : "Archived" },
  action: task.status === "active"
    ? { name: "item.archive", label: "Archive" }
    : { name: "", label: "Archived" },
});
