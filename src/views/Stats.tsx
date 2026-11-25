import { useState, type CSSProperties } from 'react';
import { Figure } from '../components/Figure';
import { KINDS, KIND_LABEL, PROGRAM_START, sessionsFor, SEASON_START, TESTS, type TestDef } from '../data/programme';
import { addDays, capitalize, dayAndMonth, mondayOf, shortDate, todayKey, WEEKDAY_INITIALS, weekdayName, weekRange } from '../lib/dates';
import { speedUnit } from '../lib/prefs';
import { go, href, replace } from '../lib/router';
import {
  bestOf,
  dayCount,
  dayLevel,
  daysSinceStart,
  firstDay,
  formatClock,
  formatHours,
  formatKg,
  formatKm,
  formatMinutes,
  formatTest,
  gap,
  journal,
  nights,
  parseTest,
  percent,
  runs,
  sleepSummary,
  BED_TARGET,
  WAKE_TARGET,
  streaks,
  summarize,
  swingAvg,
  swingMax,
  tally,
  TEST_INPUT,
  testHistory,
  testKey,
  totals,
  weeklySeries,
  weekReport,
  WEIGHT_GOAL,
  WEIGHT_ID,
  WEIGHT_START,
  weights,
  type TestResult,
} from '../lib/stats';
import { getEntry, updateEntry, useStore, type Entries } from '../lib/store';
import { Chart, Icon, kindStyle, Segmented, TopBar } from '../ui';

/** La page d'accueil de Progrès : l'essentiel en un coup d'œil, le détail un niveau plus bas. */
function Summary({ entries }: { entries: Entries }) {
  const today = todayKey();
  const monday = mondayOf(today);
  const unit = speedUnit();
  const maxes = swingMax(entries);
  const lastSpeed = maxes[maxes.length - 1];
  const bestSpeed = maxes.reduce<number | null>((m, p) => (m === null || p.value > m ? p.value : m), null);
  const ws = weights(entries);
  const lastWeight = ws[ws.length - 1];
  // Les séances d'entraînement de la semaine, sans la mobilité du matin.
  const week = { done: 0, planned: 0 };
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    for (const s of sessionsFor(d)) {
      if (s.kind === 'mobilite') continue;
      week.planned++;
      if (getEntry(entries, d, s.id).done) week.done++;
    }
  }
  const shownTests = TESTS.filter((t) => ['tractions', 'pompes', 'detente', 'cinq-km'].includes(t.id));
  const details: { id: Tab; title: string; sub: string; icon: 'stats' | 'calendar' | 'scale' | 'golf' | 'check' }[] = [
    { id: 'tests', title: 'Tous les tests', sub: 'Historique, records, saisie à une date', icon: 'check' },
    { id: 'golf', title: 'Vitesse de swing', sub: 'Courbe de la vitesse max et moyenne', icon: 'golf' },
    { id: 'corps', title: 'Poids et sommeil', sub: 'Courbes et régularité des nuits', icon: 'scale' },
    { id: 'vue', title: 'Séances', sub: 'Régularité, semaines, bilan à copier', icon: 'stats' },
    { id: 'journal', title: 'Journal', sub: 'Toutes les séances faites et tes notes', icon: 'calendar' },
  ];
  return (
    <main className="screen">
      <header className="page-head">
        <div>
          <p className="overline">Depuis le {dayAndMonth(PROGRAM_START)}</p>
          <h1>Progrès</h1>
        </div>
      </header>

      <a className="stat-hero" href={href('progres', 'golf')} style={kindStyle('vitesse')}>
        <span className="stat-label">Vitesse de club au driver</span>
        <span className="stat-big num">
          {lastSpeed ? lastSpeed.value : '–'}
          <span className="stat-unit"> {unit}</span>
        </span>
        <span className="stat-sub">{lastSpeed ? `Record : ${bestSpeed} ${unit}` : 'Note ta première séance au practice avec le bouton +'}</span>
      </a>

      <div className="stat-pair">
        <a className="stat-card" href={href('progres', 'corps')} style={{ '--k': 'var(--poids)' } as CSSProperties}>
          <span className="stat-label">Poids</span>
          <span className="stat-mid num">
            {lastWeight ? lastWeight.value.toLocaleString('fr-FR') : WEIGHT_START}
            <span className="stat-unit"> kg</span>
          </span>
          <span className="stat-sub">Objectif {WEIGHT_GOAL} kg</span>
        </a>
        <a className="stat-card" href={href('progres', 'vue')} style={{ '--k': 'var(--accent)' } as CSSProperties}>
          <span className="stat-label">Cette semaine</span>
          <span className="stat-mid num">
            {week.done}
            <span className="stat-unit"> / {week.planned}</span>
          </span>
          <span className="stat-sub">séances faites</span>
        </a>
      </div>

      <div className="section-head">
        <p className="eyebrow">Tests</p>
        <a className="text-link" href={href('progres', 'tests')}>
          Tout voir
        </a>
      </div>
      <ul className="value-list">
        {shownTests.map((test) => {
          const results = testHistory(entries, test.id);
          const last = results[results.length - 1];
          return (
            <li key={test.id}>
              <span>{test.name}</span>
              {last ? <strong className="num">{formatTest(test, last.value)}</strong> : <span className="muted">à faire</span>}
            </li>
          );
        })}
      </ul>

      <p className="eyebrow">En détail</p>
      <ul className="link-list">
        {details.map((d) => (
          <li key={d.id}>
            <a href={href('progres', d.id)}>
              <span className="row-icon">
                <Icon name={d.icon} size={20} />
              </span>
              <span className="row-text">
                <span className="row-title">{d.title}</span>
                <span className="row-sub">{d.sub}</span>
              </span>
              <Icon name="next" size={18} />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

type Tab = 'vue' | 'tests' | 'corps' | 'golf' | 'journal';
type Period = '7' | '28' | 'all';

const TABS: { id: Tab; label: string }[] = [
  { id: 'vue', label: 'Séances' },
  { id: 'tests', label: 'Tests' },
  { id: 'corps', label: 'Corps' },
  { id: 'golf', label: 'Swing' },
  { id: 'journal', label: 'Journal' },
];

const PERIODS: { id: Period; label: string }[] = [
  { id: '7', label: '7 jours' },
  { id: '28', label: '4 semaines' },
  { id: 'all', label: 'Tout' },
];

const dateLabel = (day: string) => shortDate(day);

export function Stats({ tab: routeTab }: { tab?: string }) {
  const { entries } = useStore();
  if (!routeTab) return <Summary entries={entries} />;
  const tab: Tab = TABS.some((t) => t.id === routeTab) ? (routeTab as Tab) : 'vue';

  return (
    <main className="screen">
      <TopBar title="Progrès en détail" fallback={['progres']} />
      <Segmented options={TABS} value={tab} onChange={(next) => replace('progres', next)} label="Rubrique" />
      {tab === 'vue' && <Overview entries={entries} />}
      {tab === 'tests' && <Tests entries={entries} />}
      {tab === 'corps' && <Body entries={entries} />}
      {tab === 'golf' && <Swing entries={entries} />}
      {tab === 'journal' && <Journal entries={entries} />}
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
        <p className="muted">{t.total.planned > 0 ? `de régularité : ${t.total.done} séances faites sur ${t.total.planned} prévues` : 'Valide ta première séance pour démarrer le suivi.'}</p>
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
        {KINDS.filter((k) => k !== 'vitesse').map((kind) => {
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
          <a className="text-link" href={href('programme', heatDay)}>
            Ouvrir ce jour
          </a>
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

      <h2 className="section-title">Bilan en texte</h2>
      <section className="panel">
        <p className="muted">Copie le résumé détaillé de la semaine pour le coller dans une conversation avec Claude.</p>
        <button type="button" className="button" onClick={copyReport}>
          {copied ? 'Bilan copié' : 'Copier le bilan de la semaine'}
        </button>
        <a className="button ghost" href={href('bilan', mondayOf(today))}>
          Ouvrir le bilan de la semaine
        </a>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tests

function Tests({ entries }: { entries: Entries }) {
  return (
    <>
      <p className="lead">Les tests reviennent toutes les quatre semaines, en semaine allégée. Tu peux aussi noter un résultat à la main, à n’importe quelle date.</p>
      <p className="hint">Repère TPI : les lancers rotatif et poitrine sont plus liés à la vitesse de club que la détente.</p>
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
  const [day, setDay] = useState(todayKey());
  const best = bestOf(test, results);
  const last = results[results.length - 1];
  const first = results[0];
  const parsed = parseTest(test, text);
  const input = TEST_INPUT[test.unit];

  const save = () => {
    if (parsed === null || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    updateEntry(day, testKey(test.id), { done: true, data: { value: parsed } });
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
          {results.length > 1 && <Chart key={results.length} series={[{ name: test.name, points: results }]} format={(v) => formatTest(test, v)} label={`Évolution : ${test.name}`} dates={dateLabel} />}
          {trend && <p className="muted small">{trend}</p>}
        </>
      ) : (
        <p className="muted test-empty">Pas encore de résultat.</p>
      )}

      {open ? (
        <div className="test-form">
          <div className="field-row">
            <label className="field">
              <span>{input.label}</span>
              <input inputMode={input.mode} placeholder={input.placeholder} value={text} autoFocus onChange={(e) => setText(e.target.value)} />
            </label>
            <label className="field">
              <span>Date</span>
              <input type="date" value={day} max={todayKey()} onChange={(e) => setDay(e.target.value)} />
            </label>
          </div>
          <div className="player-actions is-row">
            <button type="button" className="button ghost" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button type="button" className="button primary" disabled={parsed === null} onClick={save}>
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

// ---------------------------------------------------------------------------
// Corps : poids et sommeil

function Body({ entries }: { entries: Entries }) {
  const today = todayKey();
  const list = weights(entries);
  const last = list[list.length - 1];
  const [text, setText] = useState('');
  const [day, setDay] = useState(today);
  const value = Number(text.replace(',', '.'));
  const valid = text.trim() !== '' && Number.isFinite(value) && value > 30 && value < 200;
  const goal = [
    { day: PROGRAM_START, value: WEIGHT_START },
    { day: SEASON_START, value: WEIGHT_GOAL },
  ];
  const recent = list.filter((p) => p.day >= addDays(today, -14));
  const perWeek = recent.length >= 2 ? ((recent[recent.length - 1].value - recent[0].value) / Math.max(1, (Date.parse(recent[recent.length - 1].day) - Date.parse(recent[0].day)) / 86_400_000)) * 7 : null;

  const sleep7 = sleepSummary(entries, addDays(today, -6), today);
  const sleep28 = sleepSummary(entries, addDays(today, -27), today);
  const last14 = nights(entries).filter((n) => n.day > addDays(today, -14));

  return (
    <>
      <h2 className="section-title">Poids</h2>
      <section className="panel">
        <dl className="facts">
          <div>
            <dt>Actuel</dt>
            <dd className="num">{last ? formatKg(last.value) : '–'}</dd>
          </div>
          <div>
            <dt>Objectif en mars</dt>
            <dd className="num">{formatKg(WEIGHT_GOAL)}</dd>
          </div>
          <div>
            <dt>Rythme récent</dt>
            <dd className="num">{perWeek === null ? '–' : `${perWeek >= 0 ? '+' : ''}${perWeek.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} kg/sem`}</dd>
          </div>
        </dl>
        {list.length > 0 ? (
          <Chart series={[{ name: 'Poids', points: list }]} goal={goal} format={formatKg} label="Évolution du poids, avec la trajectoire visée vers 70 kg" dates={dateLabel} />
        ) : (
          <p className="muted">Pas encore de pesée. Une par semaine suffit, le lundi matin à jeun.</p>
        )}
        <p className="muted small">
          {perWeek === null
            ? 'La ligne pointillée est la trajectoire visée : environ 300 g par semaine.'
            : perWeek < 0.15
              ? 'Tu prends moins de 150 g par semaine : ajoute une collation ou un peu plus de féculents.'
              : perWeek > 0.6
                ? 'Tu prends plus de 600 g par semaine : c’est un peu rapide, réduis légèrement les portions.'
                : 'Le rythme est bon, continue comme ça.'}
        </p>
        <div className="field-row">
          <label className="field">
            <span>Poids (kg)</span>
            <input inputMode="decimal" placeholder="66,4" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={day} max={today} onChange={(e) => setDay(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="button"
          disabled={!valid}
          onClick={() => {
            updateEntry(day, WEIGHT_ID, { done: true, data: { value: Math.round(value * 10) / 10 } });
            setText('');
          }}
        >
          Ajouter une pesée
        </button>
      </section>

      <h2 className="section-title">Sommeil</h2>
      <section className="panel">
        <dl className="facts">
          <div>
            <dt>Moyenne sur 7 jours</dt>
            <dd className="num">{sleep7.count ? formatHours(sleep7.average) : '–'}</dd>
          </div>
          <div>
            <dt>Nuits à l’heure, 4 semaines</dt>
            <dd className="num">{sleep28.count ? `${sleep28.onTime} sur ${sleep28.count}` : '–'}</dd>
          </div>
        </dl>
        {last14.length > 0 ? (
          <div className="sleep-bars" role="group" aria-label="Durée des 14 dernières nuits">
            {last14.map((n) => {
              const onTime = gap(n.bed, BED_TARGET) <= 30 && gap(n.wake, WAKE_TARGET) <= 30;
              return (
                <div key={n.day} className="sleep-bar" title={`${shortDate(n.day)} : ${formatHours(n.minutes)}, couché à ${n.bed}, levé à ${n.wake}`}>
                  <span className={`sleep-fill${onTime ? ' is-on-time' : ''}`} style={{ height: `${Math.min(100, (n.minutes / 600) * 100)}%` }} />
                  <span className="week-tick num">{shortDate(n.day).split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">Ta nuit se note chaque matin depuis l’écran Aujourd’hui.</p>
        )}
        <p className="muted small">Objectif : coucher à minuit, lever à 8 h, 8 h de sommeil. Les barres pleines sont les nuits à moins de 30 minutes des horaires visés.</p>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Vitesse de swing

function Swing({ entries }: { entries: Entries }) {
  const unit = speedUnit();
  const max = swingMax(entries);
  const avg = swingAvg(entries);
  const best = max.reduce<{ day: string; value: number } | undefined>((b, p) => (!b || p.value > b.value ? p : b), undefined);
  const last = max[max.length - 1];
  const first = max[0];
  const fmt = (v: number) => `${Math.round(v)} ${unit}`;
  return (
    <>
      <section className="panel" style={kindStyle('vitesse')}>
        <dl className="facts">
          <div>
            <dt>Record au driver</dt>
            <dd className="num">{best ? fmt(best.value) : '–'}</dd>
          </div>
          <div>
            <dt>Dernière séance</dt>
            <dd className="num">{last ? fmt(last.value) : '–'}</dd>
          </div>
          <div>
            <dt>Depuis le début</dt>
            <dd className="num">{first && last && max.length > 1 ? `${last.value - first.value >= 0 ? '+' : ''}${Math.round(last.value - first.value)} ${unit}` : '–'}</dd>
          </div>
        </dl>
        {max.length > 0 ? (
          <Chart series={[{ name: 'Max', points: max }, { name: 'moyenne', points: avg, muted: true }]} format={fmt} label="Vitesse de club au driver, maximale et moyenne" dates={dateLabel} />
        ) : (
          <p className="muted">Pas encore de séance. Lance une séance de vitesse au practice et note ta vitesse au R10.</p>
        )}
        <button type="button" className="button" onClick={() => go('seance', todayKey(), 'vitesse')}>
          <Icon name="golf" size={20} />
          Je suis au practice
        </button>
      </section>
      <p className="hint">Si ta puissance (lancers, détente) progresse et pas ta vitesse de club, la limite est plutôt technique. L’inverse indique une limite physique.</p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Journal

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
