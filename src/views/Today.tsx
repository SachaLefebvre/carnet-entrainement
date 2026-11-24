import { useState } from 'react';
import { ATHLETE, findSession, PROGRAM_START, sessionsFor, SPEED_PER_WEEK, weekInfo } from '../data/programme';
import { addDays, capitalize, dayAndMonth, dayNumber, diffDays, mondayOf, todayKey, weekday, WEEKDAY_INITIALS, WEEKDAY_NAMES, weekdayName } from '../lib/dates';
import { go, href } from '../lib/router';
import { BED_TARGET, dayCount, formatHours, formatKg, nightMinutes, SLEEP_ID, speedCount, streaks, WAKE_TARGET, WEIGHT_GOAL, WEIGHT_ID, weights } from '../lib/stats';
import { getEntry, updateEntry, useStore, type Entries } from '../lib/store';
import { Icon, kindStyle, Ring, SessionCard } from '../ui';
import { resumableSession } from './Player';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Bonne nuit';
  if (hour < 18) return 'Bonjour';
  return 'Bonsoir';
}

function headline(done: number, planned: number) {
  if (planned === 0) return 'Journée de repos';
  if (done === 0) return 'La journée commence';
  if (done === planned) return 'Journée complète';
  const left = planned - done;
  return left === 1 ? 'Plus qu’une séance' : `Encore ${left} séances`;
}

export function Today() {
  const { entries } = useStore();
  const today = todayKey();
  const info = weekInfo(today);
  const monday = mondayOf(today);
  const sessions = sessionsFor(today);
  const count = dayCount(entries, today);
  const streak = streaks(entries);
  const resumable = resumableSession(today);
  const todo = sessions.filter((s) => !getEntry(entries, today, s.id).done);
  const done = sessions.filter((s) => getEntry(entries, today, s.id).done);
  const speed = speedCount(entries, monday);
  const speedToday = getEntry(entries, today, 'vitesse').done;
  const wd = weekday(today);
  const weekWeights = weights(entries).filter((p) => p.day >= monday);
  const showWeight = info.started && weekWeights.length === 0;
  const showSleep = !getEntry(entries, today, SLEEP_ID).data.wake && new Date().getHours() >= 5;
  const bilanMonday = wd === 6 ? monday : wd === 0 ? addDays(monday, -7) : null;
  const showBilan = bilanMonday !== null && weekInfo(bilanMonday).started;

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

      {showSleep && <SleepCard day={today} />}

      {!info.started ? (
        <BeforeStart today={today} />
      ) : (
        <>
          <section className="hero">
            <Ring value={count.planned ? count.done / count.planned : 0} size={124} stroke={12} label={`${count.done} séances faites sur ${count.planned}`}>
              <span className="ring-big">
                {count.done}
                <span className="ring-small">/{count.planned}</span>
              </span>
            </Ring>
            <div className="hero-text">
              <h2 className="hero-title">{headline(count.done, count.planned)}</h2>
              <p className="muted">
                {info.bloc.name}, semaine {info.w + 1} sur {info.bloc.weeks}
              </p>
              <div className="chips">
                <span className="chip">
                  <Icon name="flame" size={16} />
                  {streak.current} jour{streak.current > 1 ? 's' : ''} d’affilée
                </span>
                {info.light && <span className="chip is-accent">Semaine allégée et tests</span>}
              </div>
            </div>
          </section>

          {showWeight && <WeightCard day={today} entries={entries} monday={wd === 0} />}

          {showBilan && bilanMonday && (
            <a className="callout bilan-callout" href={href('bilan', bilanMonday)}>
              <span className="callout-title">{wd === 6 ? 'Le bilan de ta semaine est prêt' : 'Le bilan de la semaine dernière'}</span>
              <span className="muted">Régularité, sommeil, poids, progrès, et les ajustements à valider pour la suite.</span>
            </a>
          )}

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

          <h2 className="section-title">Vitesse de swing</h2>
          <section className="panel speed-panel" style={kindStyle('vitesse')}>
            <div className="speed-head">
              <div>
                <p className="speed-count num">
                  {speed}
                  <span className="ring-small">/{SPEED_PER_WEEK}</span>
                </p>
                <p className="muted small">séances cette semaine, au practice</p>
              </div>
              <div className="speed-dots" aria-hidden="true">
                {Array.from({ length: SPEED_PER_WEEK }, (_, i) => (
                  <span key={i} className={i < speed ? 'is-done' : ''} />
                ))}
              </div>
            </div>
            <button type="button" className={speedToday ? 'button ghost' : 'button'} onClick={() => go('seance', today, 'vitesse')}>
              <Icon name="golf" size={20} />
              {speedToday ? 'Voir la séance du jour' : 'Je suis au practice'}
            </button>
          </section>

          <div className="section-head">
            <h2 className="section-title">Cette semaine</h2>
            <a className="text-link" href={href('programme')}>
              Voir le programme
            </a>
          </div>
          <section className="panel">
            <div className="week-strip">
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(monday, i);
                const c = dayCount(entries, day);
                return (
                  <a key={day} className={`week-day${day === today ? ' is-today' : ''}`} href={href('programme', day)} aria-label={`${WEEKDAY_NAMES[i]} ${dayNumber(day)} : ${c.done} sur ${c.planned}`}>
                    <span className="week-initial">{WEEKDAY_INITIALS[i]}</span>
                    <Ring value={day > today || !c.planned ? 0 : c.done / c.planned} size={34} stroke={4} label="">
                      <span className="week-num">{dayNumber(day)}</span>
                    </Ring>
                  </a>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function BeforeStart({ today }: { today: string }) {
  const days = diffDays(today, PROGRAM_START);
  const first = findSession(PROGRAM_START, 'bas-a');
  return (
    <section className="panel start-panel">
      <p className="overline">Nouveau programme</p>
      <p className="big-number num">J-{days}</p>
      <p>
        Le programme démarre le <strong>lundi 30 novembre</strong> avec le bloc Fondations. Première séance : {first?.title}.
      </p>
      <p className="muted small">Cette semaine sert aux tests de départ. Note tes résultats dans Progrès, puis Tests : ils serviront de point de comparaison.</p>
      <a className="button" href={href('progres', 'tests')}>
        Noter mes tests
      </a>
    </section>
  );
}

const TIME_RE = /^\d{2}:\d{2}$/;

function SleepCard({ day }: { day: string }) {
  const [editing, setEditing] = useState(false);
  const [bed, setBed] = useState(BED_TARGET);
  const [wake, setWake] = useState(WAKE_TARGET);
  const save = (b: string, w: string) => {
    if (!TIME_RE.test(b) || !TIME_RE.test(w)) return;
    updateEntry(day, SLEEP_ID, { done: true, data: { bed: b, wake: w } });
  };
  return (
    <section className="panel sleep-card">
      <p className="panel-head">
        <span className="with-icon">
          <Icon name="moon" size={18} />
          Ta nuit
        </span>
        {!editing && <span className="num">{formatHours(nightMinutes(bed, wake))}</span>}
      </p>
      {editing ? (
        <>
          <div className="field-row">
            <label className="field">
              <span>Couché à</span>
              <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} />
            </label>
            <label className="field">
              <span>Levé à</span>
              <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
            </label>
          </div>
          <p className="muted small">{TIME_RE.test(bed) && TIME_RE.test(wake) ? `${formatHours(nightMinutes(bed, wake))} de sommeil.` : 'Indique les deux heures.'}</p>
          <button type="button" className="button primary" onClick={() => save(bed, wake)}>
            Enregistrer
          </button>
        </>
      ) : (
        <>
          <p className="muted">
            Couché à minuit, levé à 8 h, comme prévu ?
          </p>
          <div className="player-actions is-row">
            <button type="button" className="button ghost" onClick={() => setEditing(true)}>
              Corriger
            </button>
            <button type="button" className="button primary" onClick={() => save(BED_TARGET, WAKE_TARGET)}>
              Oui, c’est ça
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function WeightCard({ day, entries, monday }: { day: string; entries: Entries; monday: boolean }) {
  const [text, setText] = useState('');
  const value = Number(text.replace(',', '.'));
  const valid = text.trim() !== '' && Number.isFinite(value) && value > 30 && value < 200;
  const all = weights(entries);
  const last = all[all.length - 1];
  return (
    <section className="panel weight-card">
      <p className="panel-head">
        <span className="with-icon">
          <Icon name="scale" size={18} />
          {monday ? 'Pesée du lundi' : 'Pesée de la semaine'}
        </span>
        {last && <span className="muted small">Dernière : {formatKg(last.value)}</span>}
      </p>
      <p className="muted small">Le matin, à jeun, après être passé aux toilettes. Objectif : {WEIGHT_GOAL} kg en mars.</p>
      <div className="inline-form">
        <label className="field">
          <span className="sr-only">Poids en kg</span>
          <input inputMode="decimal" placeholder="66,4" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <span className="unit">kg</span>
        <button
          type="button"
          className="button primary"
          disabled={!valid}
          onClick={() => {
            updateEntry(day, WEIGHT_ID, { done: true, data: { value: Math.round(value * 10) / 10 } });
            setText('');
          }}
        >
          Enregistrer
        </button>
      </div>
    </section>
  );
}
