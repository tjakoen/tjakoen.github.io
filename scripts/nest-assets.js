// site/nest-assets.js — the shared visual primitives for the colony.
// The game and the note figures both import this file, so there is one definition of the ant cells
// and one sample of the Braille mound. Nothing here is note-only.
export const ANT_BODY = [[0,0],[1,1],[1,2]].concat(
  ["", "", "", ".xxx.xx.xxxxx.", "xxxx.xxx.xxxxx", ".xxx.xx.xxxxx."]
    .flatMap((row, y) => [...row].map((k, x) => (k === "x" ? [x, y] : null)).filter(Boolean)),
);
export const ANT_LEGS_A = [[5,2],[4,1],[9,2],[10,1],[7,6],[8,7],[2,6],[1,7]];
export const ANT_LEGS_B = [[7,2],[8,1],[3,2],[2,1],[5,6],[4,7],[10,6],[11,7]];

const dot = ([x, y]) => `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`;

export function antMarkup({ flyer = false } = {}) {
  const wings = flyer
    ? '<g class="wing"><ellipse cx="9" cy="2" rx="5" ry="2.2" opacity=".45"/><ellipse cx="15" cy="2" rx="5" ry="2.2" opacity=".45"/></g>'
    : "";
  return `<svg width="23" height="13" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${ANT_BODY.map(dot).join("")}${wings}<g class="legs-a">${ANT_LEGS_A.map(dot).join("")}</g><g class="legs-b">${ANT_LEGS_B.map(dot).join("")}</g></svg>`;
}

export function miniArt(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const width = 18;
  const height = 8;
  const cells = new Int8Array(width * height).fill(-1);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = (x - width / 2) / (width / 2);
      const top = height * u * u;
      const hash = ((x * 73 + y * 151) % 97) / 97;
      if (y >= top && ((x + y) % 2 === 0 || y < top + 1.2) && hash < p) cells[y * width + x] = 0;
    }
  }
  for (let y = 0; y < 3; y++) {
    for (let x = width / 2 - 2; x < width / 2 + 2; x++) cells[y * width + x] = -1;
  }
  const bits = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  let output = "";
  for (let row = 0; row < height; row += 4) {
    for (let col = 0; col < width; col += 2) {
      let code = 0;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          if (cells[(row + dy) * width + col + dx] >= 0) code |= bits[dy][dx];
        }
      }
      output += String.fromCharCode(0x2800 + code);
    }
    output += "\n";
  }
  return output.trimEnd();
}

export function antClasses(role, side = "main") {
  const classes = ["nest-ant", "walk"];
  if (role === "scout") classes.push("scout");
  if (role === "soldier" || role === "guard" || role === "rival-guard") classes.push("soldier");
  if (role === "flyer" || role === "rival-flyer") classes.push("flyer");
  if (role === "builder") classes.push("builder");
  if (role.startsWith("rival-")) classes.push(role);
  if (side === "rival" || role.startsWith("rival-")) classes.push("rival");
  return classes.join(" ");
}
