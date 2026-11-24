import { useState } from 'react';
import { blocStarts, dayOfSession, findSession, legConflicts, MOVABLE, MOVE_KEY, movesFor, PROGRAM_START, SCHEDULE, SPEED_PER_WEEK, weekInfo } from '../data/programme';
import { addDays, capitalize, dayAndMonth, mondayOf, shortDate, todayKey, WEEKDAY_INITIALS, WEEKDAY_NAMES, weekRange } from '../lib/dates';
import { go, replace } from '../lib/router';
import { dayCount, speedCount } from '../lib/stats';
import { getEntry, updateEntry, useStore } from '../lib/store';
import { Icon, kindStyle, SessionCard } from '../ui';

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
          <p className="overline">{info.started ? `${info.bloc.name}, semaine ${info.w + 1} sur ${info.bloc.weeks}` : 'Avant le programme'}</p>
          <h1>Programme</h1>
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

      <Timeline monday={monday} />

      {info.started && (
        <section className="panel">
          <p className="panel-head">
            Bloc {info.bloc.name}
            {info.light && <span className="tag">allégée</span>}
          </p>
          <p className="muted">{info.bloc.focus}</p>
          {info.light && <p className="small">Semaine de tests : ils sont intégrés au début de Bas A, Haut A et Haut B, et le 5 km remplace la course de samedi.</p>}
        </section>
      )}

      <div className="section-head">
        <h2 className="section-title">Semaine {weekRange(monday)}</h2>
        {monday !== mondayOf(today) && (
          <button type="button" className="text-link as-button" onClick={() => setDay(today)}>
            Aujourd’hui
          </button>
        )}
      </div>

      {!info.started ? (
        <p className="muted">Semaine de tests de départ, hors application. Le programme commence le lundi {dayAndMonth(PROGRAM_START)}.</p>
      ) : (
        <>
          {conflicts.length > 0 && (
            <div className="callout warn-callout" role="status">
              <span className="callout-title">Deux séances de jambes trop proches</span>
              <span className="muted">
                {conflicts.join(' ; ')}. Laisse si possible un jour entre les deux pour que les jambes et les tibias récupèrent.
              </span>
            </div>
          )}
          <p className="hint">Mobilité du matin tous les jours. Touche « Déplacer » pour changer une séance de jour cette semaine.</p>
          <div className="days">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(monday, i);
              const ids = MOVABLE.filter((id) => dayOfSession(monday, id) === i);
              const c = dayCount(entries, d);
              return (
                <section key={d} className={`day-group${d === today ? ' is-today' : ''}`}>
                  <p className="day-head">
                    <span>
                      {WEEKDAY_NAMES[i]} {shortDate(d)}
                    </span>
                    <span className="muted num small">
                      {c.done} sur {c.planned}
                    </span>
                  </p>
                  {ids.length === 0 && <p className="muted small">Repos (mobilité seulement).</p>}
                  {ids.map((id) => {
                    const session = findSession(d, id);
                    if (!session) return null;
                    const entry = getEntry(entries, d, id);
                    return (
                      <div key={id} className="move-wrap">
                        <SessionCard day={d} session={session} entry={entry} />
                        {!entry.done && (
                          <button type="button" className="text-link as-button move-button" aria-expanded={moving === id} onClick={() => setMoving(moving === id ? null : id)}>
                            <Icon name="move" size={16} />
                            {moves[id] !== undefined ? 'Déplacée, changer encore' : 'Déplacer'}
                          </button>
                        )}
                        {moving === id && (
                          <div className="move-sheet" role="group" aria-label={`Déplacer ${session.title}`}>
                            {WEEKDAY_INITIALS.map((initial, to) => (
                              <button key={to} type="button" aria-pressed={to === i} aria-label={WEEKDAY_NAMES[to]} onClick={() => move(id, to)}>
                                {initial}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>

          <section className="panel speed-panel" style={kindStyle('vitesse')}>
            <p className="panel-head">
              Vitesse de swing
              <span className="num">
                {speed} sur {SPEED_PER_WEEK}
              </span>
            </p>
            <p className="muted small">Au practice, sans jour fixe. Évite deux jours de suite.</p>
            {monday === mondayOf(today) && (
              <button type="button" className="button" onClick={() => go('seance', today, 'vitesse')}>
                <Icon name="golf" size={20} />
                Je suis au practice
              </button>
            )}
          </section>
        </>
      )}
    </main>
  );
}

/** Frise des blocs jusqu'à la saison, avec la semaine affichée. */
function Timeline({ monday }: { monday: string }) {
  const starts = blocStarts();
  const total = starts.reduce((n, s) => n + s.bloc.weeks, 0);
  const index = weekInfo(monday).index;
  const marker = Math.max(0, Math.min(index, total - 1));
  return (
    <section className="panel timeline-panel">
      <div className="timeline" role="img" aria-label={`Frise des blocs. Semaine ${index + 1} du programme.`}>
        {starts.map(({ bloc, monday: start }, i) => {
          const before = starts.slice(0, i).reduce((n, s) => n + s.bloc.weeks, 0);
          const current = index >= before && index < before + bloc.weeks;
          return (
            <div key={bloc.id} className={`timeline-bloc${current ? ' is-current' : ''}`} style={{ flexGrow: bloc.weeks }}>
              <span className="timeline-name">{bloc.name.replace('-', '-​')}</span>
              <span className="timeline-date num">{capitalize(shortDate(start))}</span>
            </div>
          );
        })}
        {index >= 0 && <span className="timeline-marker" style={{ left: `${((marker + 0.5) / total) * 100}%` }} />}
      </div>
    </section>
  );
}
