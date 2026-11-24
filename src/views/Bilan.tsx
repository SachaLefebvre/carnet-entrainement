import { useState } from 'react';
import { KINDS, KIND_LABEL, SPEED_PER_WEEK, TESTS, weekInfo } from '../data/programme';
import { acceptSuggestion, dismissSuggestion, suggestions } from '../lib/adjust';
import { addDays, mondayOf, shortDate, todayKey, weekRange } from '../lib/dates';
import { speedUnit } from '../lib/prefs';
import { href } from '../lib/router';
import { formatHours, formatKg, formatTest, percent, sleepSummary, speedCount, swingMax, tally, testHistory, weekReport, weights } from '../lib/stats';
import { useStore } from '../lib/store';
import { kindStyle, TopBar } from '../ui';

export function Bilan({ monday: routeMonday }: { monday?: string }) {
  const { entries } = useStore();
  const monday = routeMonday && /^\d{4}-\d{2}-\d{2}$/.test(routeMonday) ? mondayOf(routeMonday) : mondayOf(todayKey());
  const sunday = addDays(monday, 6);
  const info = weekInfo(monday);
  const t = tally(entries, monday, sunday);
  const pct = percent(t.total);
  const sleep = sleepSummary(entries, monday, sunday);
  const speed = speedCount(entries, monday);
  const swings = swingMax(entries).filter((p) => p.day >= monday && p.day <= sunday);
  const bestSwing = swings.reduce((m, p) => Math.max(m, p.value), 0);
  const allWeights = weights(entries);
  const weekWeight = allWeights.filter((p) => p.day >= monday && p.day <= sunday).pop();
  const before = allWeights.filter((p) => p.day < monday).pop();
  const tests = TESTS.map((test) => ({ test, result: testHistory(entries, test.id).filter((r) => r.day >= monday && r.day <= sunday).pop() })).filter((x) => x.result);
  const props = suggestions(entries, monday, sunday);
  const [copied, setCopied] = useState(false);

  const verdict =
    pct === null
      ? 'Pas encore de séance enregistrée cette semaine.'
      : pct >= 90
        ? 'Excellente semaine : le programme a été suivi.'
        : pct >= 70
          ? 'Bonne semaine, quelques séances ont sauté.'
          : 'Semaine difficile. Si c’est la fatigue, la semaine suivante peut être reprise sans rattraper.';

  return (
    <main className="screen">
      <TopBar title="Bilan de la semaine" fallback={[]} />
      <p className="overline">
        {info.started ? `${info.bloc.name}, semaine ${info.w + 1}` : 'Avant le programme'} : {weekRange(monday)}
      </p>
      <section className="panel">
        <p className="big-number num">{pct === null ? '–' : `${pct} %`}</p>
        {t.total.planned > 0 && (
          <p className="muted">
            de régularité, {t.total.done} séances sur {t.total.planned}
          </p>
        )}
        <p>{verdict}</p>
        <ul className="kind-bars">
          {KINDS.filter((k) => k !== 'vitesse').map((kind) => {
            const c = t.byKind[kind];
            return (
              <li key={kind} style={kindStyle(kind)}>
                <span className="kind-dot" />
                <span className="kind-name">{KIND_LABEL[kind]}</span>
                <span className="kind-count num">
                  {c.done} sur {c.planned}
                </span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${c.planned ? (c.done / c.planned) * 100 : 0}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="tiles">
        <div className="stat-tile" style={kindStyle('vitesse')}>
          <span className="stat-value num">
            {speed}/{SPEED_PER_WEEK}
          </span>
          <span className="stat-label">séances de vitesse{bestSwing ? `, max ${bestSwing} ${speedUnit()}` : ''}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value num">{sleep.count ? formatHours(sleep.average) : '–'}</span>
          <span className="stat-label">{sleep.count ? `de sommeil, ${sleep.onTime} nuit${sleep.onTime > 1 ? 's' : ''} à l’heure sur ${sleep.count}` : 'de sommeil (rien de noté)'}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value num">{weekWeight ? formatKg(weekWeight.value) : '–'}</span>
          <span className="stat-label">
            {weekWeight && before ? `${weekWeight.value - before.value >= 0 ? '+' : ''}${(weekWeight.value - before.value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kg depuis la pesée précédente` : 'pesée de la semaine'}
          </span>
        </div>
      </div>

      {tests.length > 0 && (
        <>
          <h2 className="section-title">Tests de la semaine</h2>
          <ul className="panel recorded">
            {tests.map(({ test, result }) => (
              <li key={test.id}>
                <span>{test.name}</span>
                <span className="num">{result ? formatTest(test, result.value) : ''}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="section-title">Ajustements proposés</h2>
      {props.length === 0 ? (
        <p className="muted">Rien à ajuster : le programme prévu reste adapté. Pour qu’une progression soit proposée, note tes répétitions réelles dans le mode guidé (augmente le compteur quand tu fais plus).</p>
      ) : (
        <div className="stack">
          {props.map((s) => (
            <section key={s.key} className={`panel suggestion is-${s.direction}`}>
              <p className="suggestion-title">{s.text}</p>
              <p className="muted small">
                {s.why} ({s.session}, {shortDate(s.day)})
              </p>
              <div className="player-actions is-row">
                <button type="button" className="button ghost" onClick={() => dismissSuggestion(entries, s)}>
                  Garder le prévu
                </button>
                <button type="button" className="button primary" onClick={() => acceptSuggestion(entries, s)}>
                  Valider
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="panel">
        <p className="muted small">Pour une analyse plus poussée, copie le bilan et colle-le dans une conversation avec Claude.</p>
        <button
          type="button"
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(weekReport(entries, monday));
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? 'Bilan copié' : 'Copier le bilan en texte'}
        </button>
        <a className="button ghost" href={href('progres')}>
          Voir tous mes progrès
        </a>
      </section>
    </main>
  );
}
