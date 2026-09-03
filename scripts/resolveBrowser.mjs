import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Auf Deus Machina gibt es kein Chrome, aber Edge (x86-Pfad). Reihenfolge wie im docker-Repo.
export function resolveBrowser() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].filter(Boolean);
  for (const p of candidates) if (existsSync(p)) return p;
  const pwRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (existsSync(pwRoot)) {
    for (const dir of readdirSync(pwRoot)) {
      const exe = path.join(pwRoot, dir, 'chrome-win64', 'chrome.exe');
      if (existsSync(exe)) return exe;
    }
  }
  throw new Error('Kein Chromium-Binary gefunden (Chrome/Edge/Playwright).');
}
