import { LANGS, RTL, DEFAULT_LANG, detectLang, saveLang, applyDir, getBundle, isSupport } from '../src/i18n/index.js';

function setNavigatorLanguage(value) {
  Object.defineProperty(window.navigator, 'language', { value, configurable: true });
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/code-welt/');
});

afterEach(() => setNavigatorLanguage('en-US'));

test('sechs Sprachen in fester Reihenfolge, nur ar ist RTL', () => {
  expect(LANGS.map((l) => l.code)).toEqual(['de', 'en', 'uk', 'ar', 'es', 'it']);
  expect([...RTL]).toEqual(['ar']);
  expect(DEFAULT_LANG).toBe('de');
});

test('?lang= gewinnt ueber localStorage', () => {
  saveLang('es');
  window.history.replaceState({}, '', '/code-welt/?lang=uk');
  expect(detectLang()).toBe('uk');
});

test('localStorage gewinnt ueber Browser-Sprache; unbekanntes ?lang faellt durch', () => {
  setNavigatorLanguage('es-ES');
  saveLang('it');
  expect(detectLang()).toBe('it');
  window.history.replaceState({}, '', '/code-welt/?lang=xx');
  expect(detectLang()).toBe('it');
});

test('ohne ?lang und ohne localStorage zaehlt die Browser-Sprache; unbekannte faellt auf de', () => {
  setNavigatorLanguage('uk-UA');
  expect(detectLang()).toBe('uk');
  setNavigatorLanguage('xx-XX');
  expect(detectLang()).toBe('de');
});

test('applyDir setzt lang und dir', () => {
  applyDir('ar');
  expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  expect(document.documentElement.getAttribute('lang')).toBe('ar');
  applyDir('de');
  expect(document.documentElement.getAttribute('dir')).toBe('ltr');
});

test('getBundle faellt feldweise auf Deutsch zurueck; de ist keine Stuetze', () => {
  const de = getBundle('de');
  const uk = getBundle('uk');
  expect(Object.keys(uk)).toEqual(Object.keys(de));
  expect(isSupport('de')).toBe(false);
  expect(isSupport('uk')).toBe(true);
});
