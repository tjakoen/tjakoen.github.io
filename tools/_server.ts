// portfolio/tools/_server.ts — shared helpers for the tools that boot portfolio/server.ts on a
// dedicated port (audit, export, screenshots) or attach to one (desk-audit). Deduped from three
// hand-copied waitForServer bodies and four hand-rolled env-port parses.

/** Parse a port from an env value, falling back when it is unset. A non-numeric or out-of-range value
 *  is a config error, not a silent NaN that binds the server to a broken address, so it throws and
 *  names the offending variable rather than failing obscurely later. */
export function parsePort(raw: string | undefined, fallback: number, name: string): number {
  if (raw === undefined || raw === "") return fallback;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`tools: ${name}=${JSON.stringify(raw)} is not a valid port (1-65535)`);
  }
  return port;
}

/** Poll a booting server until its root answers, or throw after the timeout. */
export async function waitForServer(base: string, timeoutMs = 15000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if ((await fetch(`${base}/`)).ok) return; } catch { /* not up yet */ }
    await Bun.sleep(200);
  }
  throw new Error(`server didn't come up on ${base}`);
}
