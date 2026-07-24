// portfolio/ai/mail-sender.ts — B3 mail batch archive ("archive everything from BREAD CI"): matching a
// visitor's FREE-TEXT sender phrase against the REAL sender set the /mail inbox rows already carry,
// never letting the model pick a sender itself (CLAUDE.md design law #2 — code enumerates the live DOM,
// the model/router only extracts what the visitor said). Pure + framework-free, same norm as actions.ts
// (lowercase, strip punctuation to spaces, collapse whitespace) and the same token-overlap shape
// notes-tags.ts uses for tags — this is that family's mail-flavored sibling. desk-reasoner.ts is the
// only caller.

const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
const tokens = (s: string): string[] => { const n = norm(s); return n ? n.split(" ") : []; };

/** Match a free-text sender phrase against the REAL sender set (never a model guess — law #2). A
 *  sender matches when the normalized phrases are equal outright, or the two token sets overlap enough
 *  that the overlap fully covers ONE side — either every sender word is also in the query ("the bread
 *  ci bot" covers "BREAD CI"), or every query word is also in the sender ("bread" is covered by
 *  "BREAD CI"). A single-letter stray overlap ("b" vs "BREAD CI" — no token equals "b") never counts:
 *  at least one overlapping token must be 2+ chars, so a short accidental hit can't hijack an archive.
 *  First BEST match across `senders` wins (exact equality, then sender-covered-by-query, then
 *  query-covered-by-sender), ties within the same rank broken by list order — never re-ranked by
 *  string length or position, just this fixed priority. */
export function matchSender(query: string, senders: string[]): string | null {
  const qn = norm(query);
  if (!qn) return null;
  const qTokens = tokens(query);
  if (!qTokens.length) return null;

  let best: { sender: string; rank: number } | null = null;
  for (const sender of senders) {
    const sn = norm(sender);
    if (!sn) continue;

    let rank: number | null = null;
    if (qn === sn) {
      rank = 0;                                    // full equality — the best possible match
    } else {
      const sTokens = tokens(sender);
      const overlap = qTokens.filter((t) => sTokens.includes(t));
      const hasLongToken = overlap.some((t) => t.length >= 2);
      if (overlap.length && hasLongToken) {
        const senderCoveredByQuery = new Set(overlap).size === new Set(sTokens).size;
        const queryCoveredBySender = new Set(overlap).size === new Set(qTokens).size;
        if (senderCoveredByQuery) rank = 1;
        else if (queryCoveredBySender) rank = 2;
      }
    }
    if (rank !== null && (best === null || rank < best.rank)) best = { sender, rank };
  }
  return best?.sender ?? null;
}
