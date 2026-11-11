import { useEffect, useState } from 'react';

// Navigation par l'ancre de l'adresse (#/seance/2026-11-11/haut-1) :
// le bouton Retour du téléphone fonctionne, sans configuration côté hébergement.

const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

export function useRoute(): string[] {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const href = (...parts: string[]) => `#/${parts.map(encodeURIComponent).join('/')}`;

export function go(...parts: string[]) {
  window.location.hash = href(...parts).slice(1);
}

/** Remplace l'écran courant, pour qu'un Retour ne ramène pas dessus. */
export function replace(...parts: string[]) {
  window.location.replace(href(...parts));
}

export function back(fallback: string[] = []) {
  if (window.history.length > 1) window.history.back();
  else go(...fallback);
}
