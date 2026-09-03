// Baut aus den Bundles und den Strukturdaten die Kursdefinition. Reine Funktion, testbar.
import { ETAPPEN, STATIONS } from '../src/data/stations.js';
import { LANGS as LANG_META } from '../src/i18n/index.js';
import { mlang, pick, LANGS } from './lib/mlang.mjs';
import { toEntities } from './lib/entities.mjs';

const COURSE_TITLE = { de: 'Code-Welt: Programmieren mit Minecraft', en: 'Code World: Coding with Minecraft', uk: 'Світ коду: програмування з Minecraft', ar: 'عالم الكود: البرمجة مع Minecraft', es: 'Mundo del código: programar con Minecraft', it: 'Mondo del codice: programmare con Minecraft' };
const COURSE_SUMMARY = {
  de: '<p>Der Agent versteht nur Code. Lerne Programmieren mit Minecraft Education: erst Blöcke, dann Python.</p><p><em>Kein offizielles Minecraft-Produkt. Nicht von Mojang oder Microsoft genehmigt oder mit ihnen verbunden.</em></p>',
  en: '<p>The Agent only understands code. Learn coding with Minecraft Education: blocks first, then Python.</p><p><em>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</em></p>',
  uk: '<p>Agent розуміє тільки код. Вивчай програмування з Minecraft Education: спочатку блоки, потім Python.</p><p><em>Це не офіційний продукт Minecraft. Не схвалено Mojang або Microsoft і не пов’язано з ними.</em></p>',
  ar: '<p>لا يفهم Agent إلا الكود. تعلَّم البرمجة مع Minecraft Education: أولًا بالمكعبات، ثم بلغة Python.</p><p><em>هذا ليس منتجًا رسميًا من Minecraft. غير معتمد من Mojang أو Microsoft وغير مرتبط بهما.</em></p>',
  es: '<p>El Agent solo entiende código. Aprende a programar con Minecraft Education: primero bloques, después Python.</p><p><em>No es un producto oficial de Minecraft. No está aprobado por Mojang ni Microsoft ni asociado con ellos.</em></p>',
  it: '<p>L’Agent capisce solo il codice. Impara a programmare con Minecraft Education: prima i blocchi, poi Python.</p><p><em>Non è un prodotto ufficiale Minecraft. Non approvato da Mojang o Microsoft né associato a loro.</em></p>',
};
const SECTION_NAMES = {
  welcome: { de: 'Willkommen', en: 'Welcome', uk: 'Ласкаво просимо', ar: 'أهلاً وسهلاً', es: 'Bienvenida', it: 'Benvenuti' },
  teacher: { de: 'Lehrkraft', en: 'Teacher', uk: 'Для вчителя', ar: 'للمعلّم', es: 'Docente', it: 'Docente' },
};
const CHOOSE = { de: 'Wähle deine Sprache: oben rechts auf deinen Namen klicken → Sprache.', en: 'Choose your language: click your name at the top right → Language.', uk: 'Обери свою мову: натисни на своє ім’я вгорі праворуч → Мова.', ar: 'اختر لغتك: اضغط على اسمك في الأعلى → اللغة.', es: 'Elige tu idioma: haz clic en tu nombre arriba a la derecha → Idioma.', it: 'Scegli la tua lingua: clicca sul tuo nome in alto a destra → Lingua.' };
const STATION_LABEL = { de: 'Station', en: 'Station', uk: 'Станція', ar: 'محطة', es: 'Estación', it: 'Stazione' };
const CHECK_LABEL = { de: 'Check', en: 'Check', uk: 'Перевірка', ar: 'اختبار', es: 'Comprobación', it: 'Verifica' };

function iframeLabel(appBase, sid) {
  const by = {};
  for (const l of LANGS) by[l] = `<div class="cw-station"><iframe src="${appBase}?lang=${l}#/station/${sid}" width="100%" height="1400" style="border:0;border-radius:12px" title="Code-Welt ${sid}" loading="lazy"></iframe></div>`;
  return mlang(by);
}

function welcomeLangLabel() {
  const rows = LANG_META.map((l) => `<p><strong>${l.flag} ${l.label}:</strong> ${CHOOSE[l.code]}</p>`).join('');
  return toEntities(`<div class="cw-welcome">${rows}</div>`);
}

export function buildCourseDef({ bundles, appBase }) {
  const nameOf = (path) => mlang(pick(bundles, path));
  const sections = [
    { num: 0, name: mlang(SECTION_NAMES.welcome), visible: 1, items: [{ key: 'welcome-lang', type: 'label', html: welcomeLangLabel() }] },
    { num: 1, name: mlang(SECTION_NAMES.teacher), visible: 0, items: [{ key: 'teacher-setup', type: 'label', html: toEntities('<p>Setup-Anleitung, Stundenverläufe und Weltdateien folgen in Plan 2.</p>') }] },
  ];
  ETAPPEN.forEach((e, i) => {
    const items = [];
    for (const sid of e.stations) {
      const s = STATIONS[sid];
      const title = pick(bundles, `stations.${sid}.title`);
      const stationName = {}; const checkName = {};
      for (const l of Object.keys(title)) {
        stationName[l] = `DS ${s.ds} · ${STATION_LABEL[l] || STATION_LABEL.de}: ${title[l]}`;
        checkName[l] = `DS ${s.ds} · ${CHECK_LABEL[l] || CHECK_LABEL.de}`;
      }
      // Label ist ein HTML-Feld: Umlaute im Titel als Entities (die iframe-URL hat keine)
      items.push({ key: `${sid}-station`, type: 'label', html: toEntities(`<h4>${mlang(stationName)}</h4>`) + iframeLabel(appBase, sid) });
      const quiz = bundles.de.stations[sid].quiz.map((q, qi) => ({
        name: `${sid} Frage ${qi + 1}`,
        text: toEntities(mlang(pick(bundles, `stations.${sid}.quiz[${qi}].q`))),
        answers: q.answers.map((a, ai) => ({ text: toEntities(mlang(pick(bundles, `stations.${sid}.quiz[${qi}].answers[${ai}].text`))), fraction: a.correct ? 100 : 0 })),
      }));
      items.push({ key: `${sid}-quiz`, type: 'quiz', name: mlang(checkName), intro: '', questions: quiz });
    }
    sections.push({ num: i + 2, name: nameOf(`etappen.${e.id}.name`), visible: 1, items });
  });
  return { fullname: mlang(COURSE_TITLE), shortname: 'code-welt', summary: toEntities(mlang(COURSE_SUMMARY)), sections };
}
