import { ATHLETE, KINDS, KIND_LABEL, PROGRAM_START, PROGRAM_WEEKS, programWeek, RUN_WEEKS, runWeekIndex, sessionsFor } from '../data/programme';
import { addDays, capitalize, dayAndMonth, dayNumber, mondayOf, todayKey, WEEKDAY_INITIALS, WEEKDAY_NAMES, weekdayName } from '../lib/dates';
import { href } from '../lib/router';
import { dayCount, percent, streaks, tally } from '../lib/stats';
import { getEntry, useStore } from '../lib/store';
import { Icon, kindStyle, Ring, SessionCard } from '../ui';
import { resumableSession } from './Player';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Bonne nuit';
  if (hour < 18) return 'Bonjour';
  return 'Bonsoir';
}

function headline(done: number, planned: number) {
  if (done === 0) return 'La journée commence';
  if (done === planned) return 'Journée complète';
  const left = planned - done;
  return left === 1 ? 'Plus qu’une séance' : `Encore ${left} séances`;
}

export function Home() {
  const { entries } = useStore();
  const today = todayKey();
  const sessions = sessionsFor(today);
  const count = dayCount(entries, today);
  const streak = streaks(entries);
  const monday = mondayOf(today);
  const week = tally(entries, monday, addDays(monday, 6));
  const weekPct = percent(week.total);
  const resumable = resumableSession(today);
  const started = today >= PROGRAM_START;
  const weekNumber = programWeek(today) + 1;
  const runWeek = RUN_WEEKS[runWeekIndex(today)];
  const todo = sessions.filter((s) => !getEntry(entries, today, s.id).done);
  const done = sessions.filter((s) => getEntry(entries, today, s.id).done);

  return (
    <main className="screen">
      <header className="home-head">
        <div>
          <p className="overline">
            {capitalize(weekdayName(today))} {dayAndMonth(today)}
          </p>
          <h1>
            {greeting()} {ATHLETE}
          </h1>
        </div>
        <a className="avatar" href={href('compte')} aria-label="Mon compte">
          {ATHLETE.charAt(0)}
        </a>
      </header>

      <section className="hero">
        <Ring value={count.planned ? count.done / count.planned : 0} size={132} stroke={12} label={`${count.done} séances faites sur ${count.planned}`}>
          <span className="ring-big">
            {count.done}
            <span className="ring-small">/{count.planned}</span>
          </span>
        </Ring>
        <div className="hero-text">
          <h2 className="hero-title">{headline(count.done, count.planned)}</h2>
          <p className="muted">
            {count.done} séance{count.done > 1 ? 's' : ''} faite{count.done > 1 ? 's' : ''} sur {count.planned} aujourd’hui
          </p>
          <div className="chips">
            <span className="chip">
              <Icon name="flame" size={16} />
              {streak.current} jour{streak.current > 1 ? 's' : ''} d’affilée
            </span>
            {started && weekNumber <= PROGRAM_WEEKS && (
              <span className="chip">
                Semaine {weekNumber} sur {PROGRAM_WEEKS}
              </span>
            )}
          </div>
        </div>
      </section>

      {todo.length > 0 && (
        <>
          <h2 className="section-title">À faire aujourd’hui</h2>
          <div className="stack">
            {todo.map((session) => (
              <SessionCard key={session.id} day={today} session={session} entry={getEntry(entries, today, session.id)} resume={resumable === session.id} />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 className="section-title">Déjà fait</h2>
          <div className="stack">
            {done.map((session) => (
              <SessionCard key={session.id} day={today} session={session} entry={getEntry(entries, today, session.id)} />
            ))}
          </div>
        </>
      )}

      <div className="section-head">
        <h2 className="section-title">Cette semaine</h2>
        <a className="text-link" href={href('planning')}>
          Voir le planning
        </a>
      </div>
      <section className="panel">
        <div className="week-strip">
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(monday, i);
            const c = dayCount(entries, day);
            return (
              <a
                key={day}
                className={`week-day${day === today ? ' is-today' : ''}`}
                href={href('planning', day)}
                aria-label={`${WEEKDAY_NAMES[i]} ${dayNumber(day)} : ${c.done} sur ${c.planned}`}
              >
                <span className="week-initial">{WEEKDAY_INITIALS[i]}</span>
                <Ring value={day > today || !c.planned ? 0 : c.done / c.planned} size={34} stroke={4} label="">
                  <span className="week-num">{dayNumber(day)}</span>
                </Ring>
              </a>
            );
          })}
        </div>
        <ul className="kind-bars">
          {KINDS.map((kind) => {
            const c = week.byKind[kind];
            // Le total visé sur la semaine entière, pas seulement les jours passés.
            const target = Array.from({ length: 7 }, (_, i) => sessionsFor(addDays(monday, i)).filter((s) => s.kind === kind && !s.optional).length).reduce((a, b) => a + b, 0);
            return (
              <li key={kind} style={kindStyle(kind)}>
                <span className="kind-dot" />
                <span className="kind-name">{KIND_LABEL[kind]}</span>
                <span className="kind-count num">
                  {c.done} sur {target}
                </span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${target ? (c.done / target) * 100 : 0}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
        <p className="panel-foot">
          {weekPct === null ? 'Coche ta première séance pour lancer le suivi.' : `${weekPct} % de régularité sur les jours écoulés.`}
        </p>
      </section>

      <h2 className="section-title">Le cap de la semaine</h2>
      <section className="panel">
        <dl className="facts">
          <div>
            <dt>Sortie longue</dt>
            <dd className="num">{runWeek.longue} min</dd>
          </div>
          <div>
            <dt>Footing facile</dt>
            <dd className="num">{runWeek.facile} min</dd>
          </div>
          <div>
            <dt>Fractionné</dt>
            <dd className="num">
              {runWeek.reps} x {runWeek.fast / 60} min
            </dd>
          </div>
        </dl>
        <p className="panel-foot">
          {runWeek.light
            ? 'Semaine allégée : c’est le moment de refaire tes tests de niveau.'
            : 'Musculation : ajoute une répétition par série dès que toutes passent avec de la réserve.'}
        </p>
        {runWeek.light && (
          <a className="button ghost" href={href('stats', 'records')}>
            Faire mes tests
          </a>
        )}
      </section>
    </main>
  );
}
