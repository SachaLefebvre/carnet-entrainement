import { Component, type ReactNode } from 'react';

interface Props {
  /** Change à chaque navigation : une erreur sur un écran ne bloque pas les suivants. */
  resetKey: string;
  children: ReactNode;
}

/** Filet de sécurité : si un écran plante, on affiche un message au lieu d'une page vide. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="screen">
        <h1>Cet écran n’a pas pu s’afficher</h1>
        <p className="lead">Tes données ne sont pas touchées. Recharge la page, ou reviens à l’accueil.</p>
        <div className="stack" style={{ marginTop: 20 }}>
          <button type="button" className="button primary" onClick={() => window.location.reload()}>
            Recharger la page
          </button>
          <a className="button" href="#/">
            Revenir à l’accueil
          </a>
        </div>
      </main>
    );
  }
}
