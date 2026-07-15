---
id: d1-bread-stack-ia
status: done
track: D
depends: []
touches: [pages/batch/index.html, pages/mill/index.html, pages/grain/index.html, BREAD-STACK-IA.md]
owner: ai
---

# Finish the five-member stack IA

The IA plan ([BREAD-STACK-IA.md](../BREAD-STACK-IA.md), authored 2026-07-08) is the source of
truth. Most of it has landed: `/bread` shows all five members, `/proof` + `/pantry` trailheads
exist, the explorer frame lists proof/ and pantry/, and `llms.ts` names all five. What remains is
the consistency pass on the older trailheads.

## Tasks

- [x] `/bread` rebuilt as the five-member directory
- [x] `/proof` trailhead
- [x] `/pantry` trailhead
- [x] proof/ + pantry/ in the explorer frame
- [x] `llms.ts` lists all five members
- [x] Status flag on `/batch` (live) and `/mill` (live) per the shared card shape
- [x] The "part of the BREAD stack" footer spine on every member trailhead
- [x] Re-read the IA's honesty rules against the shipped pages (statuses still true?) — fixed two
      stale flags on `/bread` (PROOF live-SSE-board and PANTRY v2/reference/catalog had shipped but
      the directory still said "next"), and the `/batch` lede + `PLAN.md` layer-docs bullet that d4
      made stale ("docs live beside the code" / "resolved from the installed package")
