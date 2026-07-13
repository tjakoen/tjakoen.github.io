// portfolio/plans.ts — route enumeration for the PROOF plan board mounted at /plans (server.ts).
//
// A sibling to content.ts's listPortfolioContentRoutes (same idea: ONE list of routes feeds both
// the sitemap and the export's crawl allowlist, so a new file reaches both automatically) — but
// PROOF isn't a MILL content collection, it's its own mountable layer (@tjakoen/proof/routes.ts)
// with its own route shape (`/plans` board + `/plans/plan/<id>` detail). This reads PROOF's own
// loader (loadPlans, the same one routes.ts uses to answer requests) instead of re-deriving the
// list through a second, parallel MILL collection that would fight the existing mount for the
// same URLs (§18: content pages must export — this is what makes that true for /plans).
import { loadPlans } from "@tjakoen/proof/loader.ts";
import { fileURLToPath } from "node:url";

/** the plans folder this repo's own board reads (also handed to createProofRoutes in server.ts) */
export const PLANS_DIR = fileURLToPath(new URL("./plans", import.meta.url));

/** mount prefix — kept here (not just in server.ts) so this file's routes always match what's
 *  actually mounted, even if the prefix ever changes. */
export const PLANS_PREFIX = "/plans";

/** Every route the PROOF mount answers: the board index + one entry per plan file (readdir
 *  already skips `done/` — not a `.md` file — and `README.md`, the loader's own reserved name;
 *  see proof/loader.ts). The same set server.ts's proofRoutes serves, so the sitemap and the
 *  export's crawl allowlist stay in lockstep with what's actually live. */
export async function listPlanRoutes(): Promise<string[]> {
  const { plans } = await loadPlans(PLANS_DIR);
  return [PLANS_PREFIX, ...plans.map((lp) => `${PLANS_PREFIX}/plan/${lp.plan.id}`)];
}
