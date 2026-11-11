import { useEffect, useState } from 'react';
import type { Session as AuthSession } from '@supabase/supabase-js';
import { ErrorBoundary } from './components/ErrorBoundary';
import { href, useRoute } from './lib/router';
import { clearLocal, setUser, useStore, type SyncStatus } from './lib/store';
import { supabase } from './lib/supabase';
import { Icon, TopBar } from './ui';
import { Home } from './views/Home';
import { ExercisePage, Library } from './views/Library';
import { Login } from './views/Login';
import { Plan } from './views/Plan';
import { Player } from './views/Player';
import { SessionPage } from './views/SessionPage';
import { Stats } from './views/Stats';

const TABS = [
  { route: '', label: 'Accueil', icon: 'home' },
  { route: 'planning', label: 'Planning', icon: 'calendar' },
  { route: 'exercices', label: 'Exercices', icon: 'library' },
  { route: 'stats', label: 'Stats', icon: 'stats' },
] as const;

const STATUS_TEXT: Record<SyncStatus, string> = {
  local: 'Les données sont enregistrées sur cet appareil uniquement.',
  syncing: 'Synchronisation en cours.',
  synced: 'Tout est synchronisé entre tes appareils.',
  offline: 'Hors ligne. Tes séances sont gardées sur cet appareil et partiront au retour du réseau.',
};

export default function App() {
  const route = useRoute();
  const [auth, setAuth] = useState<'loading' | 'in' | 'out'>(supabase ? 'loading' : 'in');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const apply = (session: AuthSession | null) => {
      setUser(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      setAuth(session ? 'in' : 'out');
    };
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session));
    return () => data.subscription.unsubscribe();
  }, []);

  if (auth === 'loading') return <p className="loading">Chargement</p>;
  if (auth === 'out') return <Login />;

  const [head = '', a, b] = route;
  // Le mode guidé occupe tout l'écran, sans la barre d'onglets.
  const resetKey = route.join('/');
  if (head === 'go' && a && b) {
    return (
      <ErrorBoundary resetKey={resetKey}>
        <Player key={`${a}-${b}`} day={a} id={b} />
      </ErrorBoundary>
    );
  }

  const isTab = TABS.some((t) => t.route === head);

  return (
    <ErrorBoundary resetKey={resetKey}>
      {head === '' && <Home />}
      {head === 'planning' && <Plan day={a} />}
      {head === 'exercices' && <Library />}
      {head === 'stats' && <Stats tab={a} />}
      {head === 'seance' && a && b && <SessionPage key={`${a}-${b}`} day={a} id={b} />}
      {head === 'exercice' && a && <ExercisePage id={a} />}
      {head === 'compte' && <Account email={email} />}
      {!isTab && !['seance', 'exercice', 'compte'].includes(head) && (
        <main className="screen">
          <p className="muted">Cette page n’existe pas.</p>
          <a className="button" href={href()}>
            Revenir à l’accueil
          </a>
        </main>
      )}

      {isTab && (
        <nav className="tabs" aria-label="Navigation principale">
          {TABS.map((t) => (
            <a key={t.route} href={href(...(t.route ? [t.route] : []))} aria-current={head === t.route ? 'page' : undefined}>
              <Icon name={t.icon} />
              {t.label}
            </a>
          ))}
        </nav>
      )}
    </ErrorBoundary>
  );
}

function Account({ email }: { email: string | null }) {
  const { status, pending } = useStore();
  const signOut = async () => {
    await supabase?.auth.signOut();
    clearLocal();
  };
  return (
    <main className="screen">
      <TopBar title="Mon compte" />
      <section className="panel">
        <p className="panel-head">Synchronisation</p>
        <p className="muted">
          {STATUS_TEXT[status]}
          {pending > 0 && status !== 'local' ? ` ${pending} modification${pending > 1 ? 's' : ''} en attente.` : ''}
        </p>
      </section>
      {email && (
        <section className="panel">
          <p className="panel-head">Connecté avec</p>
          <p className="account-email">{email}</p>
          <button type="button" className="button ghost" onClick={signOut}>
            Se déconnecter
          </button>
        </section>
      )}
      <section className="panel">
        <p className="panel-head">Installer l’app</p>
        <p className="muted">Sur Android, ouvre le menu de Chrome puis choisis « Ajouter à l’écran d’accueil ». L’app s’ouvrira ensuite comme une application, même hors ligne.</p>
      </section>
    </main>
  );
}
