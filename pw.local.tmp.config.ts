import base from "./playwright.config.ts";
export default { ...base, use: { ...base.use, launchOptions: { executablePath: "/opt/pw-browsers/chromium" } } };
