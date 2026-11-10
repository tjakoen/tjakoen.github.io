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

export function antMarkup({ role = "worker", centered = false } = {}) {
  const soldier = role === "soldier" || role === "guard" || role === "rival-guard";
  const flyer = role === "flyer" || role === "rival-flyer";
  const [width, height] = role === "queen" ? [40, 23] : soldier ? [25, 14] : [23, 13];
  const origin = centered ? ` x="${-width / 2}" y="${-height / 2}"` : "";
  const wings = flyer
    ? '<g class="wing"><ellipse cx="9" cy="2" rx="5" ry="2.2" opacity=".45"/><ellipse cx="15" cy="2" rx="5" ry="2.2" opacity=".45"/></g>'
    : "";
  return `<svg width="${width}" height="${height}"${origin} viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${ANT_BODY.map(dot).join("")}${wings}<g class="legs-a">${ANT_LEGS_A.map(dot).join("")}</g><g class="legs-b">${ANT_LEGS_B.map(dot).join("")}</g></svg>`;
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

// Geometry for the sidebar's nest cutaway. Both its live renderer and the note's compact view use
// this layout, so the queen's chamber, nursery, larder, stores, tunnels, soil, and mound stay aligned.
export const NEST_LAYOUT = Object.freeze({
  surface: 0.16,
  mound: 0.075,
  routes: Object.freeze({
    down: [[0.5, 0.16 - 0.075 * 0.55], [0.5, 0.3], [0.73, 0.44], [0.8, 0.6]],
    feed: [[0.8, 0.6], [0.68, 0.77], [0.58, 0.87]],
    up: [[0.58, 0.87], [0.38, 0.74], [0.32, 0.47], [0.5, 0.3], [0.5, 0.16 - 0.075 * 0.55]],
    lay: [[0.42, 0.89], [0.38, 0.74], [0.3, 0.51], [0.2, 0.54]],
    hatch: [[0.2, 0.54], [0.32, 0.47], [0.5, 0.3], [0.5, 0.16 - 0.075 * 0.55]],
  }),
  nursery: [0.2, 0.54],
  larder: [0.8, 0.61],
  queen: [0.5, 0.89],
  stores: [[0.13, 0.76], [0.87, 0.8]],
});

export const nestRouteLength = (route) => route.slice(1).reduce((sum, point, index) =>
  sum + Math.hypot(point[0] - route[index][0], point[1] - route[index][1]), 0);

export function nestRoutePoint(route, distance) {
  let remaining = distance;
  for (let index = 0; index < route.length - 1; index++) {
    const [x, y] = route[index], [nextX, nextY] = route[index + 1];
    const length = Math.hypot(nextX - x, nextY - y);
    if (remaining <= length) {
      return [x + (nextX - x) * remaining / length, y + (nextY - y) * remaining / length, Math.atan2(nextY - y, nextX - x)];
    }
    remaining -= length;
  }
  const [x, y] = route.at(-1);
  return [x, y, -Math.PI / 2];
}

export function buildNestBase(width, height) {
  const { surface, mound, routes, nursery, larder, queen, stores } = NEST_LAYOUT;
  const cells = new Int8Array(width * height).fill(-1);
  const set = (x, y, tone) => {
    x |= 0; y |= 0;
    if (x >= 0 && y >= 0 && x < width && y < height) cells[y * width + x] = tone;
  };
  const clear = (x, y) => set(x, y, -1);
  let seed = 7;
  const random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const sky = Math.round(height * surface);
  for (let y = sky + 2; y < height; y++) {
    for (let x = 0; x < width; x++) if ((x + 2 * y) % 4 === 0 || random() < 0.05) set(x, y, y < height * 0.36 ? 1 : 0);
  }
  const moundX = width * 0.5, moundWidth = width * 0.24, moundHeight = height * mound;
  for (let y = sky - moundHeight; y <= sky + 1; y++) {
    for (let x = moundX - moundWidth; x <= moundX + moundWidth; x++) {
      const u = (x - moundX) / moundWidth, top = sky - moundHeight * (1 - u * u);
      if (y >= top && ((x + y) % 2 === 0 || y < top + 1.5)) set(x, y, 1);
    }
  }
  for (let x = 0; x < width; x++) {
    if (Math.abs(x - moundX) < moundWidth) continue;
    set(x, sky + Math.round(Math.sin(x / 5) * 0.6), 2);
    if (x % 3 === 0) set(x, sky - 2 + (x % 2), 2);
  }
  const carve = (cx, cy, radiusX, radiusY) => {
    for (let y = -radiusY; y <= radiusY; y++) {
      for (let x = -radiusX; x <= radiusX; x++) if ((x * x) / (radiusX * radiusX) + (y * y) / (radiusY * radiusY) <= 1) clear(cx + x, cy + y);
    }
  };
  Object.values(routes).forEach((route) => {
    for (let index = 0; index < route.length - 1; index++) {
      for (let step = 0; step <= 50; step++) {
        carve((route[index][0] + (route[index + 1][0] - route[index][0]) * step / 50) * width,
          (route[index][1] + (route[index + 1][1] - route[index][1]) * step / 50) * height, 2, 2);
      }
    }
  });
  carve(moundX, sky - moundHeight + 1, 2, 2);
  const radius = Math.max(4, width / 7);
  carve(nursery[0] * width, nursery[1] * height, radius * 0.85, radius * 0.45);
  carve(larder[0] * width, larder[1] * height, radius * 0.85, radius * 0.45);
  stores.forEach(([u, v], index) => {
    const [tunnelX, tunnelY] = index ? [0.68, 0.77] : [0.36, 0.72];
    for (let step = 0; step <= 30; step++) carve((u + (tunnelX - u) * step / 30) * width, (v + (tunnelY - v) * step / 30) * height, 1.5, 1.5);
    carve(u * width, v * height, radius * 0.7, radius * 0.42);
  });
  carve(queen[0] * width, queen[1] * height, radius * 1.4, radius * 0.7);
  return { cells, radius };
}

const BRAILLE_BITS = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
export function encodeNestBraille(cells, width, height) {
  const output = [];
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 2) {
      let code = 0, tone = -1;
      for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) {
        const value = cells[(y + dy) * width + x + dx];
        if (value >= 0) { code |= BRAILLE_BITS[dy][dx]; tone = Math.max(tone, value); }
      }
      output.push({ char: String.fromCharCode(0x2800 + code), tone });
    }
  }
  return output;
}

// Compose the moving sidebar picture over its shared static soil and tunnel map. The game passes
// its live state; a contained note simulation can pass the same view shape from its own engine.
export function composeNestGrid(base, width, height, radius, state, now, storeCapacity) {
  const cells = base.slice();
  const put = (x, y, tone) => {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < width && y < height) cells[y * width + x] = tone;
  };
  const step = Math.floor(now / 180) % 2;
  const { nursery, larder, queen, stores: storesRoom } = NEST_LAYOUT;
  if (!state.party) {
    const qx = queen[0] * width, qy = queen[1] * height, queenState = state.queen;
    const swell = state.queenDead ? 0.9 : 1 + 0.06 * Math.sin(now / 400) + 0.25 * queenState.lay;
    const ax = radius * 0.6 * swell, ay = radius * 0.26 * swell;
    for (let y = -ay; y <= ay; y++) for (let x = -ax; x <= ax; x++) {
      if ((x * x) / (ax * ax) + (y * y) / (ay * ay) <= 1 && (Math.round(x + y) % 2 === 0 || Math.abs(y) < ay * 0.5)) put(qx + radius * 0.15 + x, qy + y, state.queenDead ? 0 : 6);
    }
    const hx = qx - radius * 0.6 - (queenState.eat > 0 ? step * 2 : 0);
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
      put(qx - radius * 0.45 + x, qy + y, 6);
      if (Math.abs(x) + Math.abs(y) < 3) put(hx - 4 + x, qy + y, 6);
    }
    for (let k = -1; k <= 1; k++) for (let s = 1; s < 4; s++) {
      const x = qx - radius * 0.45 + k * 3 + s * k + (step && k === 0 ? 1 : 0);
      put(x, qy + 2 + s, 6); put(x, qy - 2 - s, 6);
    }
    if (queenState.eat > 0) { put(hx - 8 + queenState.eat * 3, qy, 5); put(hx - 8 + queenState.eat * 3, qy - 1, 5); }
    if (queenState.lay > 0) put(qx + radius * 0.15 + ax + 2, qy, 4);
  }
  const capacity = storeCapacity(state.built), fill = Math.min(1, state.stores / capacity), per = Math.round(fill * radius * 1.1);
  storesRoom.forEach(([u, v]) => {
    for (let index = 0; index < per; index++) {
      const columns = Math.max(2, Math.floor(radius * 0.9));
      put(u * width - radius * 0.45 + index % columns, v * height + 2 - Math.floor(index / columns), 5);
    }
  });
  state.larder.forEach((_, index) => {
    if (index < radius * 0.8) { put(larder[0] * width - radius * 0.7 + index * 2, larder[1] * height + 2, 5); put(larder[0] * width - radius * 0.7 + index * 2, larder[1] * height + 1 - index % 2, 5); }
  });
  state.eggs.forEach((egg, index) => {
    const layLength = nestRouteLength(NEST_LAYOUT.routes.lay);
    const [u, v] = egg.d < layLength ? nestRoutePoint(NEST_LAYOUT.routes.lay, egg.d) : [nursery[0] - 0.08 + index % 5 * 0.035, nursery[1] + 0.01];
    const wobble = egg.d >= layLength && egg.age > 2 ? step : 0;
    put(u * width + wobble, v * height, 4); put(u * width + 1 + wobble, v * height, 4);
  });
  state.ants.forEach((ant) => {
    if (ant.where !== "nest") return;
    const route = NEST_LAYOUT.routes[ant.route];
    if (!route) return;
    const [u, v, angle] = nestRoutePoint(route, Math.min(ant.d, nestRouteLength(route)));
    const x = u * width, y = v * height, cos = Math.cos(angle), sin = Math.sin(angle), tone = ant.role === "scout" ? 5 : 3;
    for (let offset = -2; offset <= 1; offset++) put(x + cos * offset, y + sin * offset, tone);
    const leg = step ? 1 : -1;
    put(x - sin * 1.5 + cos * leg, y + cos * 1.5 + sin * leg, tone);
    put(x + sin * 1.5 - cos * leg, y - cos * 1.5 - sin * leg, tone);
    if (ant.food) { put(x + cos * 3, y + sin * 3, 5); put(x + cos * 3, y + sin * 3 - 1, 5); }
  });
  return cells;
}
