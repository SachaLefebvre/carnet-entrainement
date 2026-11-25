import { useState } from 'react';
import { Figure } from '../components/Figure';
import { EXERCISES } from '../data/exercises';
import { contactCount, dose, exerciseCount, findSession, KIND_LABEL } from '../data/programme';
import { capitalize, dayAndMonth, todayKey, weekdayName } from '../lib/dates';
import { go, href } from '../lib/router';
import { formatClock, formatKm, formatMinutes, parseClock } from '../lib/stats';
import { getEntry, updateEntry, useStore } from '../lib/store';
import { Icon, kindStyle, TopBar } from '../ui';
import { lastLoad } from '../lib/adjust';
import { speedUnit } from '../lib/prefs';
import { testKey } from '../lib/stats';
import { resumableSession } from './Player';

export function SessionPage({ day, id }: { day: string; id: string }) {
  const { entries } = useStore();
  const session = findSession(day, id);
  const entry = getEntry(entries, day, id);
  const [km, setKm] = useState(entry.data.distanceKm ? String(entry.data.distanceKm).replace('.', ',') : '');
  const [time, setTime] = useState(entry.data.timeSec ? formatClock(entry.data.timeSec) : '');
  const [hr, setHr] = useState(entry.data.hr ? String(entry.data.hr) : '');
  const [open, setOpen] = useState<number[]>([]);

  if (!session) {
    return (
      <main className="screen">
        <TopBar title="Séance" fallback={['planning']} />
        <p className="muted">Cette séance n’existe pas ce jour-là.</p>
      </main>
    );
  }

  const today = todayKey();
  const isRun = Boolean(session.run);
  const isSpeed = session.kind === 'vitesse';
  const contacts = contactCount(session);
  const guided = exerciseCount(session) > 0;
  const resume = resumableSession(day) === id;
  const dateLabel = day === today ? 'Aujourd’hui' : `${capitalize(weekdayName(day))} ${dayAndMonth(day)}`;
  const count = exerciseCount(session);
  const distance = Number(km.replace(',', '.'));
  const seconds = parseClock(time);
  const pace = distance > 0 && seconds ? seconds / distance : null;

  const runValid = distance > 0 && distance < 100 && Boolean(seconds);
  const bpm = Number(hr);
  const hrValid = hr.trim() === '' || (Number.isFinite(bpm) && bpm >= 60 && bpm <= 230);

  const saveRun = () => {
    if (!runValid || !hrValid) return;
    const data = { ...entry.data, distanceKm: distance, timeSec: seconds ?? undefined };
    if (hr.trim()) data.hr = Math.round(bpm);
    else delete data.hr;
    updateEntry(day, id, { done: true, data });
    // Le 5 km de la semaine de tests alimente directement le record (ramené à 5 km pile).
    if (session.runTest && seconds && distance >= 4.9) updateEntry(day, testKey(session.runTest), { done: true, data: { value: Math.round((seconds * 5) / distance) } });
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
        </p>
        <h1>{session.title}</h1>
        <p className="cover-meta">
          {[`${session.minutes} min`, count > 0 ? `${count} exercice${count > 1 ? 's' : ''}` : '', contacts > 0 ? `${contacts} sauts` : ''].filter(Boolean).join(' · ')}
          {entry.done && (
            <span className="done-pill">
              <Icon name="check" size={14} />
              Faite
            </span>
          )}
        </p>
      </section>

      <p className="lead">{session.intro}</p>

      {isRun && (
        <section className="panel run-result">
          <p className="panel-head">Ton résultat</p>
          <p className="muted small">
            {session.runTest ? 'Reporte la distance et le temps de Strava : ton 5 km est enregistré comme test.' : 'Après ta course, reporte ce que Strava a mesuré.'}
          </p>
          <div className="field-row">
            <label className="field">
              <span>Distance (km)</span>
              <input inputMode="decimal" placeholder="8,5" value={km} onChange={(e) => setKm(e.target.value)} />
            </label>
            <label className="field">
              <span>Temps (min:s)</span>
              <input inputMode="text" placeholder="52:30" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Fréquence cardiaque moyenne (facultatif)</span>
            <input inputMode="numeric" placeholder="152" value={hr} onChange={(e) => setHr(e.target.value)} />
          </label>
          {pace && (
            <p className="pace">
              <span className="num">{formatClock(pace)}</span> au km, pour {formatKm(distance)} km
            </p>
          )}
          {time !== '' && seconds === null && <p className="error">Écris le temps sous la forme 52:30, ou 1:05:30 au-delà d’une heure.</p>}
          {!hrValid && <p className="error">La fréquence cardiaque doit être entre 60 et 230.</p>}
          <button type="button" className="button primary" disabled={!runValid || !hrValid} onClick={saveRun}>
            {entry.done ? 'Mettre à jour la course' : 'Enregistrer la course'}
          </button>
        </section>
      )}

      {(entry.done || isRun) && (entry.data.durationSec || recorded.length > 0) && (
        <section className="panel">
          <p className="panel-head">{isRun ? 'Ton échauffement' : 'Ce que tu as fait'}</p>
          {entry.data.durationSec ? <p className="muted">Durée : {formatMinutes(entry.data.durationSec)}</p> : null}
          {recorded.length > 0 && (
            <ul className="recorded">
              {recorded.map(([ex, values]) => (
                <li key={ex}>
                  <span>
                    {EXERCISES[ex]?.name ?? ex}
                    {entry.data.loads?.[ex] ? <span className="muted small">, {entry.data.loads[ex]}</span> : null}
                  </span>
                  <span className="num">{values.join(' / ')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isSpeed && <SpeedForm day={day} />}

      {session.blocks.length > 0 && (
        <div className="blocks">
          {session.blocks.map((block, b) => {
            const isOpen = open.includes(b);
            return (
              <section key={block.title} className={`block${isOpen ? ' is-open' : ''}`}>
                <h2 className="block-head-wrap">
                  <button type="button" className="block-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? open.filter((x) => x !== b) : [...open, b])}>
                    <span className="block-index num">{b + 1}</span>
                    <span className="block-title">{block.title}</span>
                    <span className="block-count">
                      {block.display ? '' : `${block.items.length} exercice${block.items.length > 1 ? 's' : ''}`}
                    </span>
                    <span className="block-chevron">
                      <Icon name="next" size={18} />
                    </span>
                  </button>
                </h2>
                {isOpen && (
                  <div className="block-items">
                    {block.items.map((item, i) => {
                      const exercise = EXERCISES[item.ex];
                      const load = item.equip ? lastLoad(entries, item.ex, item.adjustKey) : undefined;
                      return (
                        <a key={`${item.ex}-${i}`} className="exercise-row" href={href('exercice', item.ex)}>
                          <div className="exercise-thumb">
                            <Figure anim={exercise.anim} label="" />
                          </div>
                          <div className="exercise-text">
                            <span className="exercise-name">{item.label ?? exercise.name}</span>
                            {item.note && <span className="exercise-note">{item.note}</span>}
                            {load && <span className="exercise-note">Dernière charge : {load}</span>}
                          </div>
                          <span className="exercise-dose num">{dose(item)}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <label className="field note-field">
        <span>Note</span>
        <textarea
          rows={2}
          value={entry.note}
          placeholder={isSpeed ? 'Sensations, conditions (froid, balles de practice)' : 'Sensations, difficultés, ce que tu veux retenir'}
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
                {resume ? 'Reprendre la séance' : isRun ? 'Démarrer l’échauffement' : 'Démarrer la séance'}
              </button>
            )}
            {!isRun && (
              <button type="button" className={guided ? 'button ghost' : 'button primary'} onClick={() => updateEntry(day, id, { done: true })}>
                {guided ? 'Déjà faite, la valider' : 'Marquer comme faite'}
              </button>
            )}
            {isRun && !guided && <p className="muted small action-hint">Note ton résultat ci-dessus après ta course.</p>}
          </>
        )}
      </div>
    </main>
  );
}

function SpeedForm({ day }: { day: string }) {
  const { entries } = useStore();
  const entry = getEntry(entries, day, 'vitesse');
  const unit = speedUnit();
  const [max, setMax] = useState(entry.data.max ? String(entry.data.max) : '');
  const [avg, setAvg] = useState(entry.data.avg ? String(entry.data.avg) : '');
  const [saved, setSaved] = useState(false);
  const m = Number(max.replace(',', '.'));
  const a = Number(avg.replace(',', '.'));
  const valid = max.trim() !== '' && Number.isFinite(m) && m > 20 && m < 250 && (avg.trim() === '' || (Number.isFinite(a) && a > 20 && a <= m));
  return (
    <section className="panel" style={kindStyle('vitesse')}>
      <p className="panel-head">Ta vitesse au R10</p>
      <p className="muted small">Vitesse de tête de club au driver, en {unit}. L’unité se change dans ton compte.</p>
      <div className="field-row">
        <label className="field">
          <span>Maximale</span>
          <input inputMode="decimal" placeholder={unit === 'mph' ? '108' : '174'} value={max} onChange={(e) => setMax(e.target.value)} />
        </label>
        <label className="field">
          <span>Moyenne</span>
          <input inputMode="decimal" placeholder={unit === 'mph' ? '104' : '167'} value={avg} onChange={(e) => setAvg(e.target.value)} />
        </label>
      </div>
      <button
        type="button"
        className="button primary"
        disabled={!valid}
        onClick={() => {
          const data = { ...entry.data, max: Math.round(m) };
          if (avg.trim()) data.avg = Math.round(a);
          else delete data.avg;
          updateEntry(day, 'vitesse', { done: true, data });
          setSaved(true);
        }}
      >
        {saved || entry.done ? 'Enregistré, mettre à jour' : 'Enregistrer la séance'}
      </button>
    </section>
  );
}
