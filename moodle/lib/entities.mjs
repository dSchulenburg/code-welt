// Umlaute als Entities — nur fuer HTML-Felder (Label, Fragetext, Summary), nie fuer Namen.
const MAP = { 'ä': '&auml;', 'ö': '&ouml;', 'ü': '&uuml;', 'Ä': '&Auml;', 'Ö': '&Ouml;', 'Ü': '&Uuml;', 'ß': '&szlig;' };
export function toEntities(html) {
  return String(html).replace(/[äöüÄÖÜß]/g, (c) => MAP[c]);
}
