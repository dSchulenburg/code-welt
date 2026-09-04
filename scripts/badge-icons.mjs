#!/usr/bin/env node
// Rendert die Badge-SVGs (src/assets/badges/*.svg, 200x200 flache Silhouetten) als 256x256-PNG
// nach moodle/badges/ -- Moodle-Badges brauchen ein Rasterbild, kein SVG. Aufruf:
//   node scripts/badge-icons.mjs
//
// Die Liste der erwarteten Icons kommt aus ETAPPEN[].badge.icon (src/data/stations.js), nicht aus
// einem Verzeichnis-Scan (Final-Review-Fix B) -- ein Verzeichnis-Scan haette eine fehlende SVG nie
// gemeldet, nur weniger PNGs erzeugt (das waere "raten", welche Etappen ein Badge brauchen, statt
// die Strukturdaten zu fragen). Etappen, deren Stationen noch nicht gebaut sind (Eisen, Gold, ...,
// s. postbuild.mjs), haben ihr badge.icon zwar schon in den Strukturdaten, aber noch keine SVG --
// das ist hier kein Fehler im Sinn von "kaputt", sondern erwarteter Zwischenstand; die Zeile wird
// trotzdem gemeldet (nicht stillschweigend uebersprungen) und der Exitcode zeigt es an.
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ETAPPEN } from '../src/data/stations.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(HERE, '..', 'src', 'assets', 'badges');
const OUT_DIR = path.join(HERE, '..', 'moodle', 'badges');
const SIZE = 256;

mkdirSync(OUT_DIR, { recursive: true });

// Icon-Dateiname kann sich zwischen Etappen wiederholen (kommt hier nicht vor, waere aber
// harmlos) -- ueber ein Set dedupliziert, damit dieselbe SVG nicht zweimal gerendert wird.
const expectedIcons = [...new Set(ETAPPEN.map((e) => e.badge?.icon).filter(Boolean))];
if (expectedIcons.length === 0) {
  console.error('ETAPPEN liefert kein einziges badge.icon -- src/data/stations.js pruefen');
  process.exit(1);
}

let missing = 0;
for (const icon of expectedIcons) {
  const stem = icon.replace(/\.png$/, '');
  const svgPath = path.join(SRC_DIR, `${stem}.svg`);
  if (!existsSync(svgPath)) {
    console.error(`fehlt: src/assets/badges/${stem}.svg (fuer badge.icon "${icon}")`);
    missing++;
    continue;
  }
  const outPath = path.join(OUT_DIR, `${stem}.png`);
  await sharp(svgPath).resize(SIZE, SIZE).png().toFile(outPath);
  console.log(`${stem}.svg -> moodle/badges/${stem}.png (${SIZE}x${SIZE})`);
}

if (missing > 0) {
  console.error(`\n${missing} von ${expectedIcons.length} Badge-SVGs fehlen (siehe oben).`);
  process.exit(1);
}
