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

export function stepMovement(ant, tx, ty, dt, speed, { now, blocked = () => false, maxStep = Infinity, wander = 0.12 } = {}) {
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
