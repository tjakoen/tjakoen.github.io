// portfolio/demo/view/components.ts — thin wrappers over render()
import { render } from "../../render.ts";
import type { LoopCardView } from "../services/task-views.ts";
export const LoopCard = (view: LoopCardView) => render("loop-card", view);
