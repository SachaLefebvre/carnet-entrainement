import { useState } from 'react';
import { Figure } from '../components/Figure';
import { KINDS, KIND_LABEL, TESTS, type TestDef } from '../data/programme';
import { addDays, capitalize, dayAndMonth, mondayOf, shortDate, todayKey, WEEKDAY_INITIALS, weekdayName, weekRange } from '../lib/dates';
import { href, replace } from '../lib/router';
import {
  bestOf,
  dayCount,
  dayLevel,
  daysSinceStart,
  firstDay,
  formatClock,
  formatKm,
  formatMinutes,
  formatTest,
  journal,
  parseClock,
  percent,
  runs,
  streaks,
  summarize,
  tally,
  testHistory,
  testKey,
  totals,
  weeklySeries,
  weekReport,
  type TestResult,
} from '../lib/stats';
import { updateEntry, useStore, type Entries } from '../lib/store';
import { kindStyle, Segmented } from '../ui';

type Tab = 'vue' | 'journal' | 'records';
type Period = '7' | '28' | 'all';

const TABS: { id: Tab; label: string }[] = [
  { id: 'vue', label: 'Vue d’ensemble' },
  { id: 'journal', label: 'Journal' },
  { id: 'records', label: 'Records' },
];

const PERIODS: { id: Period; label: string }[] = [
  { id: '7', label: '7 jours' },
  { id: '28', label: '4 semaines' },
  { id: 'all', label: 'Tout' },
];

export function Stats({ tab: routeTab }: { tab?: string }) {
  const { entries } = useStore();
  const tab: Tab = TABS.some((t) => t.id === routeTab) ? (routeTab as Tab) : 'vue';

  return (
    <main className="screen">
      <header className="page-head">
        <div>
          <p className="overline">Jour {daysSinceStart(entries)} du suivi</p>
          <h1>Statistiques</h1>
        </div>
      </header>
      <Segmented options={TABS} value={tab} onChange={(next) => replace('stats', next)} label="Rubrique" />
      {tab === 'vue' && <Overview entries={entries} />}
      {tab === 'journal' && <Journal entries={entries} />}
      {tab === 'records' && <Records entries={entries} />}
    </main>
  );
}

const HEAT_WEEKS = 12;
const BAR_WEEKS = 8;

function Overview({ entries }: { entries: Entries }) {
  const today = todayKey();
  const [period, setPeriod] = useState<Period>('7');
  const [weekIndex, setWeekIndex] = useState(BAR_WEEKS - 1);
  const [heatDay, setHeatDay] = useState(today);
  const [copied, setCopied] = useState(false);

  const from = period === 'all' ? firstDay(entries) : addDays(today, period === '7' ? -6 : -27);
  const t = tally(entries, from, today);
  const sums = totals(entries, from, today);
  const pct = percent(t.total);
  const streak = streaks(entries);
  const series = weeklySeries(entries, BAR_WEEKS);
  const selected = series[weekIndex];
  const heatStart = addDays(mondayOf(today), -7 * (HEAT_WEEKS - 1));
  const heatCount = dayCount(entries, heatDay);
  const runLog = runs(entries).slice(0, 5);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(weekReport(entries, mondayOf(today)));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Segmented options={PERIODS} value={period} onChange={setPeriod} label="Période" />

      <section className="panel">
        <p className="big-number num">{pct === null ? '–' : `${pct} %`}</p>
        <p className="muted">
          {t.total.planned > 0
            ? `de régularité : ${t.total.done} séances faites sur ${t.total.planned} prévues`
            : 'Valide ta première séance pour démarrer le suivi.'}
        </p>
        <dl className="facts">
          <div>
            <dt>Série en cours</dt>
            <dd>
              <span className="num">{streak.current}</span> j
            </dd>
          </div>
          <div>
            <dt>Meilleure série</dt>
            <dd>
              <span className="num">{streak.best}</span> j
            </dd>
          </div>
        </dl>
      </section>

      <div className="tiles">
        <div className="stat-tile">
          <span className="stat-value num">{sums.sessions}</span>
          <span className="stat-label">séances faites</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value num">{sums.seconds ? formatMinutes(sums.seconds) : '0 min'}</span>
          <span className="stat-label">chronométrées</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value num">{sums.reps}</span>
          <span className="stat-label">répétitions</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value num">{formatKm(sums.km)}</span>
          <span className="stat-label">kilomètres saisis</span>
        </div>
      </div>

      <h2 className="section-title">Par discipline</h2>
      <ul className="panel kind-bars is-large">
        {KINDS.map((kind) => {
          const c = t.byKind[kind];
          const p = percent(c);
          return (
            <li key={kind} style={kindStyle(kind)}>
              <span className="kind-dot" />
              <span className="kind-name">{KIND_LABEL[kind]}</span>
              <span className="kind-count num">{c.planned ? `${c.done} sur ${c.planned}` : 'rien de prévu'}</span>
              <span className="kind-pct num">{p === null ? '' : `${p} %`}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${p ?? 0}%` }} />
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="section-title">Régularité par semaine</h2>
      <section className="panel">
        <div className="weeks" role="group" aria-label="Régularité des 8 dernières semaines">
          <div className="weeks-grid" aria-hidden="true">
            <span>100 %</span>
            <span>50 %</span>
            <span>0</span>
          </div>
          {series.map((point, i) => (
            <button
              key={point.monday}
              type="button"
              className={`week-bar${i === weekIndex ? ' is-selected' : ''}`}
              aria-pressed={i === weekIndex}
              aria-label={`Semaine ${weekRange(point.monday)} : ${point.pct === null ? 'pas de données' : `${point.pct} %`}`}
              onClick={() => setWeekIndex(i)}
              onMouseEnter={() => setWeekIndex(i)}
            >
              <span className="week-col">{point.pct !== null && <span className="week-fill" style={{ height: `${Math.max(point.pct, 2)}%` }} />}</span>
              <span className="week-tick num">{shortDate(point.monday)}</span>
            </button>
          ))}
        </div>
        <p className="readout" aria-live="polite">
          Semaine {weekRange(selected.monday)} :{' '}
          {selected.pct === null ? (
            'pas encore de données.'
          ) : (
            <>
              <strong className="num">{selected.pct} %</strong>, {selected.count.done} séances sur {selected.count.planned}
              {selected.km > 0 ? `, ${formatKm(selected.km)} km courus` : ''}.
            </>
          )}
        </p>
      </section>

      <h2 className="section-title">Jour par jour</h2>
      <section className="panel">
        <div className="heat" role="group" aria-label="Séances faites chaque jour sur 12 semaines">
          <div className="heat-labels" aria-hidden="true">
            {WEEKDAY_INITIALS.map((initial, i) => (
              <span key={i}>{initial}</span>
            ))}
          </div>
          {Array.from({ length: HEAT_WEEKS }, (_, w) => (
            <div key={w} className="heat-week">
              {Array.from({ length: 7 }, (_, d) => {
                const day = addDays(heatStart, w * 7 + d);
                const c = dayCount(entries, day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={`heat-cell level-${dayLevel(entries, day)}${day === heatDay ? ' is-selected' : ''}`}
                    disabled={day > today}
                    aria-label={`${dayAndMonth(day)} : ${c.done} sur ${c.planned}`}
                    onClick={() => setHeatDay(day)}
                    onMouseEnter={() => day <= today && setHeatDay(day)}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <p className="readout" aria-live="polite">
          {capitalize(weekdayName(heatDay))} {dayAndMonth(heatDay)} :{' '}
          <strong className="num">
            {heatCount.done} sur {heatCount.planned}
          </strong>
          .{' '}
          <a className="text-link" href={href('planning', heatDay)}>
            Ouvrir ce jour
          </a>
        </p>
        <p className="heat-legend" aria-hidden="true">
          Rien
          <span className="heat-cell level-0" />
          <span className="heat-cell level-1" />
          <span className="heat-cell level-2" />
          <span className="heat-cell level-3" />
          <span className="heat-cell level-4" />
          Tout
        </p>
      </section>

      {runLog.length > 0 && (
        <>
          <h2 className="section-title">Dernières courses</h2>
          <ul className="panel recorded">
            {runLog.map((run) => (
              <li key={`${run.day}-${run.title}`}>
                <span>
                  {shortDate(run.day)}, {run.title.toLowerCase()}
                </span>
                <span className="num">
                  {formatKm(run.km)} km{run.seconds ? `, ${formatClock(run.seconds / run.km)} au km` : ''}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="section-title">Bilan de la semaine</h2>
      <section className="panel">
        <p className="muted">Copie le résumé détaillé de la semaine en cours pour le coller dans une conversation avec Claude et obtenir une analyse.</p>
        <button type="button" className="button" onClick={copyReport}>
          {copied ? 'Bilan copié' : 'Copier le bilan de la semaine'}
        </button>
      </section>
    </>
  );
}

function Journal({ entries }: { entries: Entries }) {
  const done = journal(entries);
  if (done.length === 0) {
    return <p className="muted empty">Aucune séance validée pour l’instant. Elles s’afficheront ici, de la plus récente à la plus ancienne.</p>;
  }
  const days = [...new Set(done.map((d) => d.day))];
  return (
    <>
      {days.map((day) => (
        <section key={day}>
          <h2 className="section-title">
            {capitalize(weekdayName(day))} {dayAndMonth(day)}
          </h2>
          <div className="stack tight">
            {done
              .filter((d) => d.day === day)
              .map(({ session, entry }) => {
                const summary = summarize(session, entry);
                return (
                  <a key={session.id} className="journal-row" href={href('seance', day, session.id)} style={kindStyle(session.kind)}>
                    <span className="kind-dot" />
                    <span className="journal-text">
                      <span className="journal-title">{session.title}</span>
                      <span className="journal-meta">{summary || KIND_LABEL[session.kind]}</span>
                      {entry.note && summary !== entry.note && <span className="journal-note">{entry.note}</span>}
                    </span>
                  </a>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}

function Records({ entries }: { entries: Entries }) {
  return (
    <>
      <p className="lead">Refais ces tests toutes les quatre semaines, frais, pour mesurer tes progrès. Les semaines allégées sont faites pour ça.</p>
      <div className="stack">
        {TESTS.map((test) => (
          <TestCard key={test.id} test={test} results={testHistory(entries, test.id)} />
        ))}
      </div>
    </>
  );
}

function TestCard({ test, results }: { test: TestDef; results: TestResult[] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const best = bestOf(test, results);
  const last = results[results.length - 1];
  const first = results[0];
  const parsed = test.unit === 'time' ? parseClock(text) : text.trim() === '' ? null : Number(text.replace(',', '.'));
  const valid = parsed !== null && Number.isFinite(parsed) && parsed > 0;

  const save = () => {
    if (!valid || parsed === null) return;
    updateEntry(todayKey(), testKey(test.id), { data: { value: Math.round(parsed) } });
    setText('');
    setOpen(false);
  };

  let trend = '';
  if (first && last && results.length > 1) {
    const delta = last.value - first.value;
    const better = test.lowerIsBetter ? delta < 0 : delta > 0;
    trend = delta === 0 ? 'Stable depuis le premier test.' : `${better ? 'Progression' : 'Recul'} de ${formatTest(test, Math.abs(delta))} depuis le premier test.`;
  }

  return (
    <section className="panel test-card">
      <div className="test-head">
        <div className="test-thumb">
          <Figure anim={test.anim} label="" />
        </div>
        <div>
          <h2 className="test-name">{test.name}</h2>
          <p className="muted small">{test.how}</p>
        </div>
      </div>

      {best && last ? (
        <>
          <dl className="facts">
            <div>
              <dt>Record</dt>
              <dd className="num">{formatTest(test, best.value)}</dd>
            </div>
            <div>
              <dt>Dernier, le {shortDate(last.day)}</dt>
              <dd className="num">{formatTest(test, last.value)}</dd>
            </div>
          </dl>
          {results.length > 1 && <Spark key={results.length} test={test} results={results} />}
          {trend && <p className="muted small">{trend}</p>}
        </>
      ) : (
        <p className="muted test-empty">Pas encore de résultat. Fais le test et note ton score.</p>
      )}

      {open ? (
        <div className="test-form">
          <label className="field">
            <span>{test.unit === 'time' ? 'Temps (min:s)' : test.unit === 'seconds' ? 'Secondes tenues' : 'Répétitions'}</span>
            <input
              inputMode={test.unit === 'time' ? 'text' : 'numeric'}
              placeholder={test.unit === 'time' ? '27:30' : test.unit === 'seconds' ? '20' : '3'}
              value={text}
              autoFocus
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="player-actions is-row">
            <button type="button" className="button ghost" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button type="button" className="button primary" disabled={!valid} onClick={save}>
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="button" onClick={() => setOpen(true)}>
          Ajouter un résultat
        </button>
      )}
    </section>
  );
}

/** Courbe d'évolution d'un test. Les valeurs exactes sont dans la liste juste en dessous. */
function Spark({ test, results }: { test: TestDef; results: TestResult[] }) {
  const [index, setIndex] = useState(results.length - 1);
  const shown = results.slice(-10);
  const active = Math.min(index, shown.length - 1);
  const values = shown.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const W = 300;
  const H = 80;
  const x = (i: number) => 12 + (i * (W - 24)) / Math.max(shown.length - 1, 1);
  const y = (v: number) => H - 12 - ((v - min) / span) * (H - 24);
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Évolution du test ${test.name}`}>
        <polyline className="spark-line" points={shown.map((r, i) => `${x(i)},${y(r.value)}`).join(' ')} />
        {shown.map((r, i) => (
          <g key={r.day}>
            <circle className={`spark-dot${i === active ? ' is-active' : ''}`} cx={x(i)} cy={y(r.value)} r={i === active ? 6 : 4.5} />
            <rect
              className="spark-hit"
              x={x(i) - 15}
              y={0}
              width={30}
              height={H}
              onMouseEnter={() => setIndex(i)}
              onClick={() => setIndex(i)}
              aria-label={`${shortDate(r.day)} : ${formatTest(test, r.value)}`}
            />
          </g>
        ))}
      </svg>
      <p className="readout" aria-live="polite">
        {shortDate(shown[active].day)} : <strong className="num">{formatTest(test, shown[active].value)}</strong>
      </p>
    </div>
  );
}
