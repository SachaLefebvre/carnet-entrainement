import { useEffect, useState } from 'react';
import type { Session as AuthSession } from '@supabase/supabase-js';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setSpeedUnit, speedUnit, type SpeedUnit } from './lib/prefs';
import { href, useRoute } from './lib/router';
import { clearLocal, resetAll, setUser, useStore, type SyncStatus } from './lib/store';
import { supabase } from './lib/supabase';
import { Icon, Segmented, TopBar } from './ui';
import { Bilan } from './views/Bilan';
import { ExercisePage, Library } from './views/Library';
import { Login } from './views/Login';
import { Player } from './views/Player';
import { Programme } from './views/Programme';
import { SessionPage } from './views/SessionPage';
import { Stats } from './views/Stats';
import { Today } from './views/Today';

const TABS = [
  { route: '', label: 'Aujourd’hui', icon: 'home' },
  { route: 'programme', label: 'Programme', icon: 'calendar' },
  { route: 'progres', label: 'Progrès', icon: 'stats' },
  { route: 'exercices', label: 'Exercices', icon: 'library' },
] as const;

const STATUS_TEXT: Record<SyncStatus, string> = {
  local: 'Les données sont enregistrées sur cet appareil uniquement.',
  syncing: 'Synchronisation en cours.',
  synced: 'Tout est synchronisé entre tes appareils.',
  offline: 'Hors ligne. Tes séances sont gardées sur cet appareil et partiront au retour du réseau.',
};

const SUB_PAGES = ['seance', 'exercice', 'compte', 'bilan'];

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
      {head === '' && <Today />}
      {head === 'programme' && <Programme key={a ?? 'now'} day={a} />}
      {head === 'exercices' && <Library />}
      {head === 'progres' && <Stats tab={a} />}
      {head === 'seance' && a && b && <SessionPage key={`${a}-${b}`} day={a} id={b} />}
      {head === 'exercice' && a && <ExercisePage id={a} />}
      {head === 'bilan' && <Bilan key={a} monday={a} />}
      {head === 'compte' && <Account email={email} />}
      {!isTab && !SUB_PAGES.includes(head) && (
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
  const [unit, setUnit] = useState<SpeedUnit>(speedUnit());
  const [confirm, setConfirm] = useState('');
  const [resetState, setResetState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const signOut = async () => {
    await supabase?.auth.signOut();
    clearLocal();
  };
  const reset = async () => {
    setResetState('busy');
    const ok = await resetAll();
    setResetState(ok ? 'done' : 'error');
    setConfirm('');
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
      <section className="panel">
        <p className="panel-head">Unité de vitesse de club</p>
        <Segmented
          options={[
            { id: 'km/h', label: 'km/h' },
            { id: 'mph', label: 'mph' },
          ]}
          value={unit}
          onChange={(next) => {
            setUnit(next);
            setSpeedUnit(next);
          }}
          label="Unité de vitesse"
        />
        <p className="muted small">Choisis la même unité que ton Garmin R10. Les valeurs déjà notées ne sont pas converties.</p>
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
      <section className="panel danger-panel">
        <p className="panel-head">Remettre à zéro</p>
        <p className="muted small">Efface toutes les séances, tests, pesées, nuits et ajustements, sur cet appareil et dans la base en ligne. C’est définitif.</p>
        {resetState === 'done' ? (
          <p>Tout est effacé. Nouveau départ.</p>
        ) : (
          <>
            <label className="field">
              <span>Écris EFFACER pour confirmer</span>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoCapitalize="characters" />
            </label>
            <button type="button" className="button danger" disabled={confirm.trim().toUpperCase() !== 'EFFACER' || resetState === 'busy'} onClick={reset}>
              {resetState === 'busy' ? 'Effacement…' : 'Tout effacer'}
            </button>
            {resetState === 'error' && <p className="error">L’effacement en ligne a échoué. Vérifie ta connexion et réessaie : rien n’a été effacé.</p>}
          </>
        )}
      </section>
    </main>
  );
}
