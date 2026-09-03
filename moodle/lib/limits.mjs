// Laengen-Guard gegen die Moodle-DB-Spalten, VOR dem ersten API-Aufruf geprueft (Fix-Report
// Task 3b). assign.name/quiz.name/page.name/folder.name/course_sections.name sind varchar(255)
// (per `SHOW COLUMNS` auf der Box gemessen, 03.09.2026 — deckt sich mit lib/db/install.xml).
// course.fullname ist auf dieser Moodle-Version (5.0, moodlehq) TYPE="char" LENGTH="1333" —
// NICHT 254, wie der urspruengliche Befund vermutete (Moodle hat das Feld vor Jahren fuer genau
// diesen {mlang}-Mehrsprachigkeitsfall verlaengert). Ein Guard mit 254 haette hier faelschlich
// den Kurs-Vollnamen selbst blockiert (383 Zeichen, seit Kurserstellung unveraendert im Feld,
// siehe registry.json courseId 10) und den Build-Lauf nie ueber die erste Zeile hinausgelassen.
// Ohne diesen Guard bricht build-course.mjs erst mitten im Lauf bei moodle_create_assignment mit
// "Error writing to database" ab (Symptom, nicht Ursache — sieben {mlang}-Bloecke aus einem zu
// langen Boss-Check-Titel sprengen assign.name). Hier kommt der Fehler frueh, mit Item-Key und
// tatsaechlicher Laenge statt einer nichtssagenden DB-Fehlermeldung.
const NAME_LIMIT = 255;
const FULLNAME_LIMIT = 1333;
const NAMED_ITEM_TYPES = new Set(['quiz', 'assignment', 'page', 'folder']);

export function assertNameLengths(def) {
  if (def.fullname.length > FULLNAME_LIMIT) {
    throw new Error(`fullname zu lang: ${def.fullname.length} > ${FULLNAME_LIMIT} Zeichen`);
  }
  for (const s of def.sections) {
    if (s.name.length > NAME_LIMIT) {
      throw new Error(`Abschnitt ${s.num} name zu lang: ${s.name.length} > ${NAME_LIMIT} Zeichen`);
    }
    for (const item of s.items) {
      if (NAMED_ITEM_TYPES.has(item.type) && item.name.length > NAME_LIMIT) {
        throw new Error(`${item.key} name zu lang: ${item.name.length} > ${NAME_LIMIT} Zeichen`);
      }
    }
  }
}
