// portfolio/src/ai/desk-timing.ts — the desk's named choreography beats.
//
// Each knob is named so it can be found and tuned twice (grain CLAUDE.md lesson 9), and shared with
// the door's own cross-page legs so the two choreographies cannot drift in pacing. Re-exported from
// desk-reasoner.ts, where existing callers still import them.
// OWN "let the click read before we leave" beat, tuned down from 950ms (too slow — 2026-07-13 owner
// call). SEPARATE from grain's own NAVIGATE_SETTLE_MS (ai-dispatch.js, 220ms): that one guards the
// navigate RenderOp itself (any settle in flight gets a beat to finish); this one is the desk's own
// choreography BEFORE it ever emits that op. Named per grain CLAUDE.md lesson #9 — a knob with no
// name can't be found, let alone tuned twice. Exported: the door's OWN tour leg (desk-door.ts,
// runTourLeg) reuses this exact knob for its intermediate-stop glide, so the two choreographies —
// the reasoner's first leg and the door's later ones — can't drift apart in pacing.
export const NAV_GLIDE_MS = 550;

// B1 contact prefill — the pause after the lamp lands on the compose field, before the draft fills in
// (and again before the lamp releases, so the visitor READS what just appeared). Named per CLAUDE.md
// lesson #9; exported so the door's OWN cross-page contact task (desk-door.ts, runContactTask) reuses
// the exact knob and the two choreographies can't drift in pacing (the MAIL_ARCHIVE_BEAT_MS precedent).
export const CONTACT_FILL_BEAT_MS = 650;

// D1 form builder demo — the pause between successive field fills as the desk drafts each demo value
// in on /grain/builder, so a visitor watching sees each one land rather than the whole form snapping full
// at once. Named per CLAUDE.md lesson #9; exported so the door's OWN cross-page fill (desk-door.ts,
// runFormTask) reuses the exact knob, the CONTACT_FILL_BEAT_MS/MAIL_ARCHIVE_BEAT_MS precedent.
export const FORM_FILL_BEAT_MS = 650;

// A4 theme switching — the pause between successive cycle-theme clicks when hopping more than one
// flavor forward. Named per CLAUDE.md lesson #9 (a knob with no name can't be found, let alone tuned
// twice): the whole point of driving the VISIBLE control rather than a private channel is that a
// visitor watching the demo sees the flavors step past one at a time, so this can't be zero.
export const THEME_CLICK_BEAT_MS = 180;

// B3 mail batch archive — the pause between successive letters as the desk archives them one at a
// time. Named per CLAUDE.md lesson #9 (a knob with no name can't be found, let alone tuned twice):
// driving the visible row + reader Archive button rather than a private channel only reads honestly if
// the visitor actually SEES each letter go, so this can't be zero. Exported: the door's OWN cross-page
// mail task (desk-door.ts, runMailTask) reuses this exact knob, so the reasoner's first-page run and
// the door's cross-page run can't drift apart in pacing (the NAV_GLIDE_MS precedent, above).
export const MAIL_ARCHIVE_BEAT_MS = 650;
