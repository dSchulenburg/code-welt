import { useEffect, useState } from 'react';
import { detectLang, saveLang, applyDir, getBundle } from './i18n/index.js';
import de from './i18n/de.js';
import { useRoute, navigate } from './lib/router.js';
import LangSwitcher from './components/LangSwitcher.jsx';
import Home from './components/Home.jsx';
import StationView from './components/StationView.jsx';

export default function App() {
  const route = useRoute();
  const [lang, setLang] = useState(detectLang);
  useEffect(() => { applyDir(lang); saveLang(lang); }, [lang]);
  const switcher = <LangSwitcher lang={lang} setLang={setLang} label={getBundle(lang).ui.langLabel} />;

  if (route.view === 'station') {
    return (
      <main className="page">
        <div className="topbar">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>← {de.ui.home}</button>
          {switcher}
        </div>
        <StationView id={route.id} lang={lang} />
      </main>
    );
  }
  return <main className="page"><Home switcher={switcher} /></main>;
}
