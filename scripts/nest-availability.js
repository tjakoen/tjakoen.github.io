export const nestDesktop = matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)");

export const firstStrayDelay = () => 120000 + Math.random() * 60000;
export const STRAY_KEY = "nest-stray-clicked";
export const strayConsumed = () => {
  try { return sessionStorage.getItem(STRAY_KEY) === "1"; } catch { return false; }
};
