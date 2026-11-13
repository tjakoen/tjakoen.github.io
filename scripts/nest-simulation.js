// The colony's small, deterministic rules shared by the game and the note figures.
export const STORE_COSTS = [12, 18, 24, 30, 36];
export const BUILD_TIME = 8;
export const RIVAL_FOUNDING_TIME = 3.2;
export const RIVAL_MOUND_HEALTH = 16;
export const MOUND_BITE_INTERVAL = 1.1;
export const TRAIL_FOLLOW_GAP = 18;

const hasOutboundJob = (job) => job === "follow" || job === "toLetter" || job === "scout-walk" || job === "forage";
const trailId = (ant) => ant.trailId ?? ant.trail?.id;
const leadOf = (ant) => ant.leadId ?? ant.lead;
const isActive = (ant) => ant.active ?? (ant.el !== undefined ? Boolean(ant.el) : ant.location !== "nest" && ant.where !== "nest");

// The note scenarios use a short yield at close range so their bounded loops can replay.
export function blockedByTrailMate(ant, ants, gap = TRAIL_FOLLOW_GAP) {
  const trail = trailId(ant);
  if (ant.job === "dance" || !trail || (ant.stuck || 0) >= 1) return false;
  return ants.some((other) => {
    if (other === ant || !isActive(other) || other.job === "crew") return false;
    if (trailId(other) !== trail || hasOutboundJob(other.job) !== hasOutboundJob(ant.job)) return false;
    const lead = leadOf(ant), otherLead = leadOf(other);
    if ((lead && otherLead === lead) || lead === other || otherLead === ant) return false;
    const dx = other.px - ant.x;
    const dy = other.py - ant.y;
    return Math.hypot(dx, dy) < gap && Math.cos(ant.heading - other.heading) > 0.2 &&
      dx * Math.cos(ant.heading) + dy * Math.sin(ant.heading) > 0;
  });
}

const trafficDirection = (job) => {
  if (hasOutboundJob(job) || job === "rival-follow") return 1;
  if (job === "home" || job === "carry" || job === "rival-home") return -1;
  return 0;
};

export function trailClearance(ant, ants, tx, ty, gap = TRAIL_FOLLOW_GAP) {
  const trail = ant.trailId ?? ant.trail;
  const direction = trafficDirection(ant.job);
  if (!trail || !direction) return Infinity;
  const length = Math.hypot(tx - ant.x, ty - ant.y);
  if (!length) return Infinity;
  const ux = (tx - ant.x) / length, uy = (ty - ant.y) / length;
  let clearance = Infinity;
  for (const other of ants) {
    if (other === ant || !isActive(other) || other.dead || other.el?.hidden || other.fightUntil) continue;
    if ((other.trailId ?? other.trail) !== trail || trafficDirection(other.job) !== direction) continue;
    const x = other.job === "carry" ? other.cx : other.x;
    const y = other.job === "carry" ? other.cy : other.y;
    const dx = x - ant.x, dy = y - ant.y;
    const ahead = dx * ux + dy * uy;
    if (ahead < 0 || (ahead === 0 && other.id > ant.id) || Math.abs(dx * uy - dy * ux) > gap / 2) continue;
    const goal = other.path?.[other.k];
    const vx = goal ? goal[0] - x : Math.cos(other.heading);
    const vy = goal ? goal[1] - y : Math.sin(other.heading);
    if (vx * ux + vy * uy < 0) continue;
    // At a bend two ants can both see the other ahead. Let the earlier ant go first.
    if (-dx * vx - dy * vy > 0 && other.id > ant.id) continue;
    clearance = Math.min(clearance, Math.max(0, ahead - gap));
  }
  return clearance;
}

export function damageMound(health) {
  return Math.max(0, health - 1);
}

export function storeCapacity(builtCount) {
  return STORE_COSTS[Math.min(builtCount, STORE_COSTS.length - 1)];
}

export function roleSpeed(role, job, baseSpeed, { letterNeed = 1, factor = 1 } = {}) {
  if (job === "carry") return baseSpeed * (role === "flyer" ? 1.7 : 1 / (1 + 0.3 * (letterNeed - 1))) * factor;
  if (job === "scout") return baseSpeed * 1.35 * factor;
  if (job === "fly" || role === "rival-flyer") return baseSpeed * 1.5 * factor;
  return baseSpeed * factor;
}

export function turnToward(ant, heading, dt) {
  const difference = ((heading - ant.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  ant.heading += difference * Math.min(1, 9 * dt);
}

export function stepMovement(ant, tx, ty, dt, speed, { now, blocked = () => false, maxStep = Infinity, wander = 0.12, obstacles = null } = {}) {
  if (obstacles?.length) {
    const detour = detourAround(ant, tx, ty, obstacles);
    if (detour) { const [dx, dy] = detour; const arrived = stepMovement(ant, dx, dy, dt, speed, { now, blocked, maxStep, wander }); return arrived && dx === tx && dy === ty; }
  }
  const dx = tx - ant.x;
  const dy = ty - ant.y;
  const distance = Math.hypot(dx, dy);
  const step = Math.min(speed * dt, maxStep);
  if (distance > 0.5) turnToward(ant, Math.atan2(dy, dx), dt);
  if (distance <= step) {
    ant.x = tx;
    ant.y = ty;
    ant.paused = false;
    return true;
  }
  if (step <= 0) { ant.paused = true; return false; }
  if (ant.job !== "carry" && blocked(ant) && (ant.stuck || 0) < 0.32) {
    ant.paused = true;
    ant.stuck = (ant.stuck || 0) + dt;
    return false;
  }
  ant.paused = false;
  if (ant.stuck) ant.stuck = Math.max(0, ant.stuck - dt * 1.4);
  const sway = Math.sin(now / 240 + ant.id * 0.7) * Math.min(wander, maxStep * 0.15);
  ant.x += (dx / distance) * step - (dy / distance) * sway;
  ant.y += (dy / distance) * step + (dx / distance) * sway;
  return false;
}

export function foodShares(letterNeed, feedFlip, queenAlive = true) {
  let stores = 0;
  let meals = 0;
  let nextFlip = feedFlip;
  for (let portion = 0; portion < Math.max(1, letterNeed || 1); portion++) {
    nextFlip = !nextFlip;
    if (nextFlip && queenAlive) stores++;
    else meals++;
  }
  return { stores, meals, feedFlip: nextFlip };
}

export function combatPower(role, side = "main") {
  return side === "rival"
    ? (role === "guard" || role === "rival-guard" ? 2 : 1)
    : (role === "soldier" || role === "guard" ? 3 : 1);
}

export function combatHealth(role, side = "main") {
  return side === "rival"
    ? (role === "guard" || role === "rival-guard" ? 2 : 1)
    : (role === "soldier" || role === "guard" ? 4 : 1);
}

export function duelOdds(mainRole, rivalRole) {
  if ((mainRole === "soldier" || mainRole === "guard") && (rivalRole === "guard" || rivalRole === "rival-guard")) return 0.6;
  if (mainRole === "flyer" && (rivalRole === "flyer" || rivalRole === "rival-flyer")) return 0.75;
  return 0.5;
}

export function groupCanWin(power, health) {
  return power >= health;
}

export function advanceBuild(progress, dt, duration = BUILD_TIME) {
  return Math.min(1, Math.max(0, progress) + dt / duration);
}

export function worshipTarget(nextParty) {
  return Math.max(8, nextParty);
}

export function worshipReturnAt(until) {
  return until - 2200;
}

// Obstacles are rectangles an ant walks around rather than through: the live figures in a note.
// Each is { l, t, r, b } in the colony's page frame. The rule is stateless so it costs nothing to
// keep: when the straight line to the target crosses a box, aim for whichever padded corner on the
// near side makes the shorter trip, and once past that corner the straight line is clear again. An
// ant that somehow stands inside a box walks out of the nearest side first. A target inside a box
// is left alone, so nothing that legitimately lives in one becomes unreachable.
export const OBSTACLE_PAD = 10;

const inside = (x, y, o, pad = 0) => x > o.l - pad && x < o.r + pad && y > o.t - pad && y < o.b + pad;

function segmentHits(x0, y0, x1, y1, o) {
  let lo = 0, hi = 1;
  const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - o.l], [dx, o.r - x0], [-dy, y0 - o.t], [dy, o.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > hi) return false; if (t > lo) lo = t; } else { if (t < lo) return false; if (t < hi) hi = t; }
  }
  return lo < hi;
}

export function detourAround(ant, tx, ty, obstacles, pad = OBSTACLE_PAD) {
  let best = null, bestT = Infinity;
  for (const o of obstacles) {
    if (inside(tx, ty, o, pad)) continue;
    if (inside(ant.x, ant.y, o)) {
      const exits = [[o.l - pad, ant.y, ant.x - o.l], [o.r + pad, ant.y, o.r - ant.x], [ant.x, o.t - pad, ant.y - o.t], [ant.x, o.b + pad, o.b - ant.y]];
      exits.sort((a, b) => a[2] - b[2]);
      return [exits[0][0], exits[0][1]];
    }
    const g = { l: o.l - pad / 2, t: o.t - pad / 2, r: o.r + pad / 2, b: o.b + pad / 2 };
    if (!segmentHits(ant.x, ant.y, tx, ty, g)) continue;
    const near = Math.hypot(Math.max(o.l - ant.x, 0, ant.x - o.r), Math.max(o.t - ant.y, 0, ant.y - o.b));
    if (near < bestT) { bestT = near; best = o; }
  }
  if (!best) return null;
  const o = best;
  const corners = [[o.l - pad, o.t - pad], [o.r + pad, o.t - pad], [o.l - pad, o.b + pad], [o.r + pad, o.b + pad]];
  let pick = null, cost = Infinity;
  for (const [cx, cy] of corners) {
    if (Math.hypot(cx - ant.x, cy - ant.y) < 1.5) continue;
    const g = { l: o.l - pad / 2, t: o.t - pad / 2, r: o.r + pad / 2, b: o.b + pad / 2 };
    if (segmentHits(ant.x, ant.y, cx, cy, g)) continue;
    // A corner that still has the box between it and the target is only a stepping stone, so it
    // loses to one that sees the target. Without this an ant just past a corner turns back to it.
    const c = Math.hypot(cx - ant.x, cy - ant.y) + Math.hypot(tx - cx, ty - cy) + (segmentHits(cx, cy, tx, ty, g) ? 1e4 : 0);
    if (c < cost) { cost = c; pick = [cx, cy]; }
  }
  return pick;
}
