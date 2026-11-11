import { useState } from 'react';
import { Figure } from '../components/Figure';
import { EXERCISES } from '../data/exercises';
import { dose, exerciseCount, findSession, KIND_LABEL } from '../data/programme';
import { capitalize, dayAndMonth, todayKey, weekdayName } from '../lib/dates';
import { go, href } from '../lib/router';
import { formatClock, formatKm, formatMinutes, parseClock } from '../lib/stats';
import { getEntry, updateEntry, useStore } from '../lib/store';
import { Icon, kindStyle, TopBar } from '../ui';
import { resumableSession } from './Player';

export function SessionPage({ day, id }: { day: string; id: string }) {
  const { entries } = useStore();
  const session = findSession(day, id);
  const entry = getEntry(entries, day, id);
  const [km, setKm] = useState(entry.data.distanceKm ? String(entry.data.distanceKm).replace('.', ',') : '');
  const [time, setTime] = useState(entry.data.timeSec ? formatClock(entry.data.timeSec) : '');

  if (!session) {
    return (
      <main className="screen">
        <TopBar title="Séance" fallback={['planning']} />
        <p className="muted">Cette séance n’existe pas ce jour-là.</p>
      </main>
    );
  }

  const today = todayKey();
  const isRun = session.kind === 'course';
  const guided = Boolean(session.phases) || exerciseCount(session) > 0;
  const resume = resumableSession(day) === id;
  const dateLabel = day === today ? 'Aujourd’hui' : `${capitalize(weekdayName(day))} ${dayAndMonth(day)}`;
  const count = exerciseCount(session);
  const distance = Number(km.replace(',', '.'));
  const seconds = parseClock(time);
  const pace = distance > 0 && seconds ? seconds / distance : null;

  const saveRun = () => {
    const data = { ...entry.data };
    if (distance > 0) data.distanceKm = distance;
    else delete data.distanceKm;
    if (seconds) data.timeSec = seconds;
    else delete data.timeSec;
    updateEntry(day, id, { data });
  };

  const recorded = Object.entries(entry.data.sets ?? {});

  return (
    <main className="screen has-action" style={kindStyle(session.kind)}>
      <TopBar title={dateLabel} fallback={['planning', day]} />

      <section className="cover">
        <div className="cover-figure">
          <Figure anim={session.anim} playing label={`Illustration : ${session.title}`} />
        </div>
        <p className="session-kind">
          {KIND_LABEL[session.kind]}
          {session.optional ? ', facultatif' : ''}
        </p>
        <h1>{session.title}</h1>
        <div className="chips">
          <span className="chip">
            <Icon name="clock" size={16} />
            {session.minutes} min
          </span>
          {count > 0 && (
            <span className="chip">
              {count} exercice{count > 1 ? 's' : ''}
            </span>
          )}
          {entry.done && (
            <span className="chip is-done">
              <Icon name="check" size={16} />
              Faite
            </span>
          )}
        </div>
      </section>

      <p className="lead">{session.intro}</p>

      {entry.done && (entry.data.durationSec || recorded.length > 0) && (
        <section className="panel">
          <p className="panel-head">Ce que tu as fait</p>
          {entry.data.durationSec ? <p className="muted">Durée : {formatMinutes(entry.data.durationSec)}</p> : null}
          {recorded.length > 0 && (
            <ul className="recorded">
              {recorded.map(([ex, values]) => (
                <li key={ex}>
                  <span>{EXERCISES[ex]?.name ?? ex}</span>
                  <span className="num">{values.join(' / ')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isRun && (
        <section className="panel">
          <p className="panel-head">Ta course</p>
          <p className="muted">Facultatif. Reporte la distance et le temps de Strava pour suivre ton allure ici.</p>
          <div className="field-row">
            <label className="field">
              <span>Distance (km)</span>
              <input inputMode="decimal" placeholder="8,5" value={km} onChange={(e) => setKm(e.target.value)} onBlur={saveRun} />
            </label>
            <label className="field">
              <span>Temps (min:s)</span>
              <input inputMode="text" placeholder="52:30" value={time} onChange={(e) => setTime(e.target.value)} onBlur={saveRun} />
            </label>
          </div>
          {pace && (
            <p className="pace">
              <span className="num">{formatClock(pace)}</span> au km, pour {formatKm(distance)} km
            </p>
          )}
          {time !== '' && seconds === null && <p className="error">Écris le temps sous la forme 52:30.</p>}
        </section>
      )}

      {session.blocks.map((block) => (
        <section key={block.title}>
          <h2 className="section-title">{block.title}</h2>
          <div className="stack tight">
            {block.items.map((item, i) => {
              const exercise = EXERCISES[item.ex];
              return (
                <a key={`${item.ex}-${i}`} className="exercise-row" href={href('exercice', item.ex)}>
                  <div className="exercise-thumb">
                    <Figure anim={exercise.anim} label="" />
                  </div>
                  <div className="exercise-text">
                    <span className="exercise-name">{exercise.name}</span>
                    {item.note && <span className="exercise-note">{item.note}</span>}
                  </div>
                  <span className="exercise-dose num">{dose(item)}</span>
                </a>
              );
            })}
          </div>
        </section>
      ))}

      <label className="field note-field">
        <span>Note</span>
        <textarea
          rows={2}
          value={entry.note}
          placeholder={session.kind === 'filet' ? 'Thème travaillé aujourd’hui' : 'Sensations, difficultés, ce que tu veux retenir'}
          onChange={(e) => updateEntry(day, id, { note: e.target.value })}
        />
      </label>

      <div className="action-bar">
        {entry.done ? (
          <button type="button" className="button ghost" onClick={() => updateEntry(day, id, { done: false })}>
            Annuler la validation
          </button>
        ) : (
          <>
            {guided && (
              <button type="button" className="button primary" onClick={() => go('go', day, id)}>
                <Icon name="play" size={20} />
                {resume ? 'Reprendre la séance' : session.phases ? 'Lancer le minuteur' : 'Démarrer la séance'}
              </button>
            )}
            <button type="button" className={guided ? 'button ghost' : 'button primary'} onClick={() => updateEntry(day, id, { done: true })}>
              {guided ? 'Marquer comme faite sans le mode guidé' : 'Marquer comme faite'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
