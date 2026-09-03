#!/usr/bin/env node
// Rendert die Badge-SVGs (src/assets/badges/*.svg, 200x200 flache Silhouetten) als 256x256-PNG
// nach moodle/badges/ -- Moodle-Badges brauchen ein Rasterbild, kein SVG. Aufruf:
//   node scripts/badge-icons.mjs
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(HERE, '..', 'src', 'assets', 'badges');
const OUT_DIR = path.join(HERE, '..', 'moodle', 'badges');
const SIZE = 256;

mkdirSync(OUT_DIR, { recursive: true });

const svgFiles = readdirSync(SRC_DIR).filter((f) => f.endsWith('.svg'));
if (svgFiles.length === 0) {
  console.error(`Keine SVGs in ${SRC_DIR} gefunden`);
  process.exit(1);
}

for (const file of svgFiles) {
  const stem = file.replace(/\.svg$/, '');
  const outPath = path.join(OUT_DIR, `${stem}.png`);
  await sharp(path.join(SRC_DIR, file)).resize(SIZE, SIZE).png().toFile(outPath);
  console.log(`${file} -> moodle/badges/${stem}.png (${SIZE}x${SIZE})`);
}
