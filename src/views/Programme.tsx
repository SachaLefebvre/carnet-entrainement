import { useState } from 'react';
import { blocStarts, dayOfSession, findSession, legConflicts, MOVABLE, MOVE_KEY, movesFor, PROGRAM_START, SCHEDULE, SPEED_PER_WEEK, weekInfo } from '../data/programme';
import { addDays, dayAndMonth, dayNumber, mondayOf, todayKey, WEEKDAY_INITIALS, WEEKDAY_NAMES, weekRange } from '../lib/dates';
import { go, href, replace } from '../lib/router';
import { speedCount } from '../lib/stats';
import { getEntry, updateEntry, useStore } from '../lib/store';
import { Icon, kindStyle } from '../ui';

const DAY_ABBR = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

export function Programme({ day: routeDay }: { day?: string }) {
  const { entries } = useStore();
  const today = todayKey();
  const valid = routeDay && /^\d{4}-\d{2}-\d{2}$/.test(routeDay) ? routeDay : today;
  const [day, setDayState] = useState(valid);
  const [moving, setMoving] = useState<string | null>(null);
  const monday = mondayOf(day);
  const info = weekInfo(monday);
  const moves = movesFor(monday);
  const conflicts = info.started ? legConflicts(monday) : [];
  const speed = speedCount(entries, monday);
  const thisWeek = monday === mondayOf(today);

  const setDay = (next: string) => {
    setDayState(next);
    setMoving(null);
    replace('programme', next);
  };

  const move = (id: string, to: number) => {
    const next = { ...moves };
    const home = SCHEDULE.findIndex((ids) => ids.includes(id));
    if (to === home) delete next[id];
    else next[id] = to;
    updateEntry(monday, MOVE_KEY, { data: { moves: next } });
    setMoving(null);
  };

  return (
    <main className="screen">
      <header className="page-head">
        <div>
          <p className="overline">
            {info.started ? `${info.bloc.name} · semaine ${info.w + 1} sur ${info.bloc.weeks}` : 'Avant le programme'}
            {info.light ? ' · allégée' : ''}
          </p>
          <h1>Programme</h1>
        </div>
        <div className="stepper">
          <button type="button" className="round-button" onClick={() => setDay(addDays(day, -7))} aria-label="Semaine précédente">
            <Icon name="back" size={18} />
          </button>
          <button type="button" className="round-button" onClick={() => setDay(addDays(day, 7))} aria-label="Semaine suivante">
            <Icon name="next" size={18} />
          </button>
        </div>
      </header>

      <BlocBar monday={monday} />

      <div className="section-head">
        <p className="eyebrow">{weekRange(monday).replace(/^du /, '')}</p>
        {!thisWeek && (
          <button type="button" className="text-link as-button" onClick={() => setDay(today)}>
            Cette semaine
          </button>
        )}
      </div>

      {!info.started ? (
        <p className="muted">Le programme commence le lundi {dayAndMonth(PROGRAM_START)}.</p>
      ) : (
        <>
          {info.light && <p className="hint">Semaine de tests : ils sont au début de Bas A, Haut A et Haut B, et le 5 km remplace la course du samedi.</p>}
          {conflicts.length > 0 && (
            <div className="callout warn-callout" role="status">
              <span className="callout-title">Deux séances de jambes trop proches</span>
              <span className="muted small">{conflicts.join(' ; ')}. Laisse si possible un jour entre les deux.</span>
            </div>
          )}

          <ul className="day-list">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(monday, i);
              const ids = MOVABLE.filter((id) => dayOfSession(monday, id) === i);
              const isToday = d === today;
              const label = (
                <span className="day-date">
                  <span className="day-abbr">{DAY_ABBR[i]}</span>
                  <span className="day-num num">{dayNumber(d)}</span>
                </span>
              );
              if (ids.length === 0) {
                return (
                  <li key={d} className={`day-row is-rest${isToday ? ' is-today' : ''}`}>
                    <div className="day-link">
                      {label}
                      <span className="day-title">Repos</span>
                    </div>
                  </li>
                );
              }
              return ids.map((id) => {
                const session = findSession(d, id);
                if (!session) return null;
                const done = getEntry(entries, d, id).done;
                return (
                  <li key={`${d}-${id}`} className={`day-row${isToday ? ' is-today' : ''}${done ? ' is-done' : ''}`} style={kindStyle(session.kind)}>
                    <a className="day-link" href={href('seance', d, id)}>
                      {label}
                      <span className="day-text">
                        <span className="day-title">{session.title}</span>
                        <span className="day-sub">
                          {session.minutes} min{moves[id] !== undefined ? ' · déplacée' : ''}
                        </span>
                      </span>
                      {done ? (
                        <span className="day-check">
                          <Icon name="check" size={16} />
                          <span className="sr-only">Faite</span>
                        </span>
                      ) : isToday ? (
                        <span className="day-today">Aujourd’hui</span>
                      ) : null}
                    </a>
                    {!done && (
                      <button type="button" className="day-move" aria-expanded={moving === id} aria-label={`Déplacer ${session.title}`} onClick={() => setMoving(moving === id ? null : id)}>
                        <Icon name="move" size={18} />
                      </button>
                    )}
                    {moving === id && (
                      <div className="move-sheet" role="group" aria-label={`Déplacer ${session.title} au`}>
                        {WEEKDAY_INITIALS.map((initial, to) => (
                          <button key={to} type="button" aria-pressed={to === i} aria-label={WEEKDAY_NAMES[to]} onClick={() => move(id, to)}>
                            {initial}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              });
            })}
          </ul>

          <button type="button" className="row-link" style={kindStyle('vitesse')} onClick={() => go('seance', thisWeek ? today : monday, 'vitesse')}>
            <span className="row-icon">
              <Icon name="golf" size={20} />
            </span>
            <span className="row-text">
              <span className="row-title">Vitesse de swing</span>
              <span className="row-sub">Au practice, sans jour fixe</span>
            </span>
            <span className="row-value num">
              {speed}/{SPEED_PER_WEEK}
            </span>
          </button>
        </>
      )}
    </main>
  );
}

/** Les blocs jusqu'à la saison, avec l'avancée dans le bloc en cours. */
function BlocBar({ monday }: { monday: string }) {
  const starts = blocStarts();
  const index = weekInfo(monday).index;
  return (
    <div className="bloc-bar" role="img" aria-label={`Semaine ${index + 1} du programme`}>
      {starts.map(({ bloc }, i) => {
        const before = starts.slice(0, i).reduce((n, s) => n + s.bloc.weeks, 0);
        const fill = Math.max(0, Math.min(1, (index + 1 - before) / bloc.weeks));
        const current = index >= before && index < before + bloc.weeks;
        return (
          <div key={bloc.id} className={`bloc-seg${current ? ' is-current' : ''}`} style={{ flexGrow: bloc.weeks }}>
            <span className="bloc-track">
              <span className="bloc-fill" style={{ width: `${fill * 100}%` }} />
            </span>
            <span className="bloc-name">{bloc.name}</span>
          </div>
        );
      })}
    </div>
  );
}
