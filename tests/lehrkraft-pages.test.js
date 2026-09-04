import { pagesFromMarkdown } from '../moodle/course-def.mjs';
import path from 'node:path';

test('Lehrkraft-Seiten DS 7-9 existieren, haben Titel und Loesungscode', () => {
  const pages = pagesFromMarkdown(path.resolve('content/lehrkraft'));
  for (const stem of ['ds07', 'ds08', 'ds09']) {
    const p = pages.find((x) => x.stem === stem);
    expect(p, stem).toBeDefined();
    expect(p.title).toMatch(/^DS [789] /);
    expect(p.html).toMatch(/<pre>/);
  }
  const welt = pages.find((x) => x.stem === '01-welt-ankunft');
  expect(welt.html).toMatch(/Erkundungsgebiet/);
  expect(welt.html).toMatch(/erkunden/);
});
