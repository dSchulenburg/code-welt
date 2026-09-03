import { useEffect, useState } from 'react';

/** Hash-Router ohne Abhaengigkeit.  #/  -> home   #/station/<id> -> Station */
export function parseHash(hash) {
  const clean = (hash || '').replace(/^#\/?/, '');
  const [path, param] = clean.split('/');
  if (path === 'station' && param) return { view: 'station', id: param };
  return { view: 'home' };
}

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
  window.scrollTo({ top: 0 });
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
