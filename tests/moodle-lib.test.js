import { extractId, hasShortname, parseSectionModules } from '../moodle/lib/mcp.mjs';
import { mlang, pick } from '../moodle/lib/mlang.mjs';
import { toEntities } from '../moodle/lib/entities.mjs';

test('extractId liest die Antwortformate des MCP', () => {
  expect(extractId('✅ Label erstellt!\n\n- **Text:** x\n- **Modul-ID:** 123', 'Modul-ID')).toBe(123);
  expect(extractId('✅ Quiz erfolgreich erstellt!\n- **Modul-ID (cmid):** 45\n- **Quiz-ID:** 9', 'Modul-ID')).toBe(45);
  expect(extractId('- **Quiz-ID:** 9', 'Quiz-ID')).toBe(9);
  expect(extractId('### Kurs\n- **ID:** 7\n', 'ID')).toBe(7);
  expect(() => extractId('nichts', 'Modul-ID')).toThrow(/Modul-ID/);
});

test('mlang baut sechs Bloecke plus other=de und laesst leere Sprachen aus', () => {
  const s = mlang({ de: 'Holz', en: 'Wood', uk: 'Дерево', ar: 'خشب', es: 'Madera', it: 'Legno' });
  expect(s).toBe('{mlang de}Holz{mlang}{mlang en}Wood{mlang}{mlang uk}Дерево{mlang}{mlang ar}خشب{mlang}{mlang es}Madera{mlang}{mlang it}Legno{mlang}{mlang other}Holz{mlang}');
  expect(mlang({ de: 'A', en: '' })).toBe('{mlang de}A{mlang}{mlang other}A{mlang}');
  expect(() => mlang({ en: 'x' })).toThrow(/de/);
});

test('pick zieht denselben Pfad aus allen Bundles', () => {
  const bundles = { de: { a: { b: 'Hallo' } }, en: { a: { b: 'Hello' } } };
  expect(pick(bundles, 'a.b')).toEqual({ de: 'Hallo', en: 'Hello' });
  expect(pick({ de: { arr: [{ t: 'x' }] } }, 'arr[0].t')).toEqual({ de: 'x' });
});

test('toEntities ersetzt nur deutsche Sonderzeichen', () => {
  expect(toEntities('Büro & Straße ÄÖÜ — Дерево خشب')).toBe('B&uuml;ro & Stra&szlig;e &Auml;&Ouml;&Uuml; — Дерево خشب');
});

test('hasShortname erkennt exakten Kurzname-Treffer aus der echten Kursliste', () => {
  const text = '## Gefundene Kurse\n\n### KI im Handel\n- **ID:** 1\n- **Kurzname:** ki-handel\n- **Kategorie ID:** 0\n';
  expect(hasShortname(text, 'ki-handel')).toBe(true);
  expect(hasShortname(text, 'ki-hand')).toBe(false);
  expect(hasShortname(text, 'code-welt')).toBe(false);
});

const COURSE_CONTENTS = `## Kursinhalte (Kurs ID: 10)

### 📁 Abschnitt 0: Welcome
- **Section ID:** 24
- **Sichtbar:** Ja

**Module (2):**
  - 💬 **Announcements** (forum)
    - CMID: 50, forum-ID: 9
    - URL: http://localhost:8080/mod/forum/view.php?id=50
  - 🏷️ **🇩🇪 Deutsch: W&auml;hle deine Sprache: oben r** (label)
    - CMID: 67, label-ID: 34

### 📁 Abschnitt 2: Wood
- **Section ID:** 26
- **Sichtbar:** Ja

**Module (2):**
  - 📝 **DS 2 · Check** (quiz)
    - CMID: 54, quiz-ID: 5
    - URL: http://localhost:8080/mod/quiz/view.php?id=54
  - 🏷️ **DS 2 · Station: Reihenfolge z&auml;hlt** (label)
    - CMID: 69, label-ID: 36

### 📁 Abschnitt 3: Stone
- **Section ID:** 27
- **Sichtbar:** Ja

*Keine Module in diesem Abschnitt*
`;

test('parseSectionModules liest Section-ID und CMIDs in Anzeige-Reihenfolge', () => {
  expect(parseSectionModules(COURSE_CONTENTS, 0)).toEqual({
    sectionId: 24,
    cmids: [50, 67],
    modules: [
      { name: 'Announcements', modname: 'forum', cmid: 50 },
      { name: '🇩🇪 Deutsch: W&auml;hle deine Sprache: oben r', modname: 'label', cmid: 67 },
    ],
  });
  expect(parseSectionModules(COURSE_CONTENTS, 2)).toEqual({
    sectionId: 26,
    cmids: [54, 69],
    modules: [
      { name: 'DS 2 · Check', modname: 'quiz', cmid: 54 },
      { name: 'DS 2 · Station: Reihenfolge z&auml;hlt', modname: 'label', cmid: 69 },
    ],
  });
});

test('parseSectionModules liefert Name und Modultyp, mit denen sich ein Modul eindeutig per Name statt per Listenposition finden laesst', () => {
  const parsed = parseSectionModules(COURSE_CONTENTS, 0);
  const found = parsed.modules.find((mod) => mod.modname === 'forum' && mod.name === 'Announcements');
  expect(found).toEqual({ name: 'Announcements', modname: 'forum', cmid: 50 });
});

test('parseSectionModules liefert leere cmids und modules fuer einen Abschnitt ohne Module', () => {
  expect(parseSectionModules(COURSE_CONTENTS, 3)).toEqual({ sectionId: 27, cmids: [], modules: [] });
});

test('parseSectionModules gibt null zurueck, wenn der Abschnitt nicht vorkommt', () => {
  expect(parseSectionModules(COURSE_CONTENTS, 99)).toBeNull();
});
