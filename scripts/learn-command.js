// portfolio/scripts/learn-command.js: the address the hidden `learn` terminal command opens.
// It is a pure function so the parsing is unit tested without a browser; desk-commands.js owns the
// command itself and the navigation.
//
//   learn                       the map                    /learn
//   learn <quest-id>            fly to a quest             /learn#quest=<quest-id>
//   learn <quest-id>.<n>        fly to stop n of a quest   /learn#stop=<quest-id>.<n>
//
// A quest id is lowercase words joined by hyphens, as the quest data writes them. A stop number is
// a positive whole number. Whether the quest exists is the map's call: an id it does not know opens
// the map at its starting view, so the command never needs a copy of the quest list.

export const LEARN_PATH = "/learn";

const QUEST_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STOP_ID = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.([1-9][0-9]{0,2})$/;

/** @param {string} arg what followed the word learn, already trimmed */
export function learnTarget(arg) {
  const word = String(arg ?? "").trim().toLowerCase();
  if (!word) return { ok: true, href: LEARN_PATH, note: "opening the learning map." };
  if (/\s/.test(word)) return { ok: false, error: "learn takes one quest id, such as ‘learn loop-setup’." };
  const stop = STOP_ID.exec(word);
  if (stop) return { ok: true, href: `${LEARN_PATH}#stop=${word}`, note: `opening stop ${stop[2]} of ${stop[1]}.` };
  if (QUEST_ID.test(word)) return { ok: true, href: `${LEARN_PATH}#quest=${word}`, note: `opening the quest ${word}.` };
  return { ok: false, error: `‘${word}’ is not a quest id. Ids are lowercase words joined by hyphens, such as ‘loop-setup’.` };
}
