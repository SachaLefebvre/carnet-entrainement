import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (signInError) {
      setError(
        signInError.status === 400
          ? 'E-mail ou mot de passe incorrect. Vérifie les deux et réessaie.'
          : 'Connexion impossible. Vérifie ta connexion internet et réessaie.',
      );
    }
  };

  return (
    <main className="screen login">
      <h1>Carnet d’entraînement</h1>
      <p className="intro">Connecte-toi pour retrouver tes séances sur ton téléphone et ton ordinateur.</p>
      <form className="panel" onSubmit={submit}>
        <label className="field">
          <span>E-mail</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Mot de passe</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Connexion en cours' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
