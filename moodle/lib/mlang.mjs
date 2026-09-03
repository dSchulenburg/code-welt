// {mlang}-Bloecke fuer filter_multilang2. Reihenfolge fest, other = Deutsch.
export const LANGS = ['de', 'en', 'uk', 'ar', 'es', 'it'];

export function mlang(byLang) {
  const de = byLang.de;
  if (de === undefined || de === null || de === '') throw new Error('mlang: de fehlt');
  let out = '';
  for (const l of LANGS) {
    const v = byLang[l];
    if (v === undefined || v === null || v === '') continue;
    out += `{mlang ${l}}${v}{mlang}`;
  }
  return out + `{mlang other}${de}{mlang}`;
}

// pick({de: bundle, en: bundle,…}, 'stations.s02.title') -> {de:'…', en:'…', …}
export function pick(bundles, path) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  const out = {};
  for (const [lang, bundle] of Object.entries(bundles)) {
    let cur = bundle;
    for (const p of parts) { cur = cur?.[p]; if (cur === undefined) break; }
    if (cur !== undefined) out[lang] = cur;
  }
  return out;
}
