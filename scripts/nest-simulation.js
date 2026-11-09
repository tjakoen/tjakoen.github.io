// The colony's small, deterministic rules shared by the game and the note figures.
export const STORE_COSTS = [12, 18, 24, 30, 36];
export const BUILD_TIME = 8;

export function storeCapacity(builtCount) {
  return STORE_COSTS[Math.min(builtCount, STORE_COSTS.length - 1)];
}

export function roleSpeed(role, job, baseSpeed, { letterNeed = 1, factor = 1 } = {}) {
  if (job === "carry") return baseSpeed * (role === "flyer" ? 1.7 : 1 / (1 + 0.3 * (letterNeed - 1))) * factor;
  if (job === "scout") return baseSpeed * 1.35 * factor;
  if (job === "fly" || role === "rival-flyer") return baseSpeed * 1.5 * factor;
  return baseSpeed * factor;
}

export function stepMovement(ant, tx, ty, dt, speed, { now, blocked = () => false } = {}) {
  const dx = tx - ant.x;
  const dy = ty - ant.y;
  const distance = Math.hypot(dx, dy);
  const step = speed * dt;
  if (distance > 0.5) {
    const desired = Math.atan2(dy, dx);
    const difference = ((desired - ant.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    ant.heading += difference * Math.min(1, 9 * dt);
  }
  if (distance <= step) {
    ant.x = tx;
    ant.y = ty;
    return true;
  }
  if (ant.job !== "carry" && blocked(ant) && (ant.stuck || 0) < 0.32) {
    ant.paused = true;
    ant.stuck = (ant.stuck || 0) + dt;
    return false;
  }
  ant.paused = false;
  if (ant.stuck) ant.stuck = Math.max(0, ant.stuck - dt * 1.4);
  const sway = Math.sin(now / 240 + ant.id * 0.7) * 0.12;
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
