import { useState } from 'react';
import { intervalText, PROGRAM_START, programWeek, RUN_WEEKS, runWeekIndex, sessionsFor } from '../data/programme';
import { addDays, capitalize, dayAndMonth, dayNumber, mondayOf, todayKey, WEEKDAY_INITIALS, WEEKDAY_NAMES, weekdayName, weekRange } from '../lib/dates';
import { replace } from '../lib/router';
import { dayCount, tally } from '../lib/stats';
import { getEntry, useStore } from '../lib/store';
import { Icon, Ring, SessionCard } from '../ui';

export function Plan({ day: routeDay }: { day?: string }) {
  const { entries } = useStore();
  const today = todayKey();
  const valid = routeDay && /^\d{4}-\d{2}-\d{2}$/.test(routeDay) ? routeDay : today;
  const [day, setDayState] = useState(valid);
  const monday = mondayOf(day);
  const week = tally(entries, monday, addDays(monday, 6));
  const sessions = sessionsFor(day);
  const count = dayCount(entries, day);
  const currentRunWeek = runWeekIndex(today);
  const started = monday >= PROGRAM_START;

  // Le jour choisi reste dans l'adresse : le bouton Retour depuis une séance ramène au bon jour.
  const setDay = (next: string) => {
    setDayState(next);
    replace('planning', next);
  };

  return (
    <main className="screen">
      <header className="page-head">
        <div>
          <p className="overline">{monday === mondayOf(today) ? 'Cette semaine' : started ? `Semaine ${programWeek(monday) + 1} du programme` : 'Avant le programme'}</p>
          <h1>Planning</h1>
        </div>
        <div className="stepper">
          <button type="button" className="icon-button" onClick={() => setDay(addDays(day, -7))} aria-label="Semaine précédente">
            <Icon name="back" />
          </button>
          <button type="button" className="icon-button" onClick={() => setDay(addDays(day, 7))} aria-label="Semaine suivante">
            <Icon name="next" />
          </button>
        </div>
      </header>

      <section className="panel">
        <p className="panel-head">
          Semaine {weekRange(monday)}
          <span className="num">
            {week.total.done} sur {week.total.planned}
          </span>
        </p>
        <div className="week-strip is-picker">
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(monday, i);
            const c = dayCount(entries, d);
            return (
              <button
                key={d}
                type="button"
                className={`week-day${d === today ? ' is-today' : ''}${d === day ? ' is-selected' : ''}`}
                aria-pressed={d === day}
                aria-label={`${WEEKDAY_NAMES[i]} ${dayNumber(d)} : ${c.done} sur ${c.planned}`}
                onClick={() => setDay(d)}
              >
                <span className="week-initial">{WEEKDAY_INITIALS[i]}</span>
                <Ring value={d > today || !c.planned ? 0 : c.done / c.planned} size={34} stroke={4} label="">
                  <span className="week-num">{dayNumber(d)}</span>
                </Ring>
              </button>
            );
          })}
        </div>
      </section>

      <div className="section-head">
        <h2 className="section-title">
          {day === today ? 'Aujourd’hui' : `${capitalize(weekdayName(day))} ${dayAndMonth(day)}`}
        </h2>
        <span className="muted num">
          {count.done} sur {count.planned}
        </span>
      </div>
      <div className="stack">
        {sessions.map((session) => (
          <SessionCard key={session.id} day={day} session={session} entry={getEntry(entries, day, session.id)} />
        ))}
      </div>
      {day !== today && (
        <button type="button" className="text-link as-button" onClick={() => setDay(today)}>
          Revenir à aujourd’hui
        </button>
      )}

      <h2 className="section-title">Progression de course</h2>
      <div className="panel flush">
        <table className="runs">
          <thead>
            <tr>
              <th scope="col">Sem.</th>
              <th scope="col">Fractionné</th>
              <th scope="col">Facile</th>
              <th scope="col">Longue</th>
            </tr>
          </thead>
          <tbody>
            {RUN_WEEKS.map((w, i) => (
              <tr key={i} className={i === currentRunWeek ? 'is-current' : ''}>
                <th scope="row" className="num">
                  {i + 1}
                  {i === currentRunWeek && <span className="sr-only"> (semaine en cours)</span>}
                </th>
                <td>
                  {intervalText(w)}
                  {w.light && <span className="tag">allégée</span>}
                </td>
                <td className="num">{w.facile} min</td>
                <td className="num">{w.longue} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">La ligne surlignée est la semaine en cours. Le fractionné commence par 15 min de footing et finit par 10 min de retour au calme.</p>
    </main>
  );
}
