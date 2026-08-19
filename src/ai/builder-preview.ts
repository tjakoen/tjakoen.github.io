// portfolio/src/ai/builder-preview.ts — the preview route's two server-side jobs, kept out of
// server.ts because both are string surgery with a reason and neither is routing.
//
// P5 of plans/site-builder.md. The owner's call on 2026-08-19, out of the two the sandbox plan left
// open, was that the preview is a REAL ROUTE rather than a framed sandbox: the tab strip is a
// projection of where you have been, so a preview becomes an ordinary open tab; the address carries
// the prompt, so it is shareable; and the static export freezes it like any other page.
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";

/**
 * Open the shell's sidebar panel on the CATALOG pane rather than on chat.
 *
 * This is the sandbox plan's fifth piece, and the plan is right that it is a default rather than a
 * mechanism: grain's shell.js already switches panes, and the frame's own comment says the SSR ships
 * the initial state. So the initial state is what this changes, three attributes of it, and it is
 * done on the server rather than by clicking the tab from a script at boot. A script would work and
 * would show the chat pane first for as long as it took to run, which is a flash of the wrong panel
 * on the one screen whose whole job is looking at something.
 *
 * Every replacement is bounded to the assistant's own markup and every one is a no-op when the shape
 * is not there, so a frame that changes underneath this degrades to the ordinary chat default rather
 * than to a broken panel.
 */
export function openCatalogPane(html: string): string {
  return html
    .replace('<div class="assistant" data-mode="chat">', '<div class="assistant" data-mode="catalog">')
    .replace('<div class="assistant__pane" data-pane="chat">', '<div class="assistant__pane" data-pane="chat" hidden>')
    .replace('<div class="assistant__pane catalog-pane" data-pane="catalog" hidden>', '<div class="assistant__pane catalog-pane" data-pane="catalog">')
    .replace('<button type="button" data-shell-mode="chat" aria-selected="true">', '<button type="button" data-shell-mode="chat" aria-selected="false">')
    .replace('<button type="button" data-shell-mode="catalog" aria-selected="false">', '<button type="button" data-shell-mode="catalog" aria-selected="true">');
}

/**
 * The markup pane's contents: the composed blocks as source a person reads.
 *
 * It takes the canvas markup the route has already rendered, rather than re-rendering, because the
 * two panes have to be the same composition and the cheapest way to guarantee that is to have one
 * source for both. Escaped, obviously: this pane's whole purpose is showing markup as text, and it
 * is the one place on this page where unescaped block HTML would be a hole rather than a feature.
 *
 * The indentation is left exactly as the renderer produced it. A prettifier here would be a second
 * opinion about the file the workbench's Tags export hands you, and the point of the pane is that
 * you are reading what you would get.
 */
export function markupPane(canvasHtml: string): string {
  return escapeHtml(canvasHtml.trim());
}
