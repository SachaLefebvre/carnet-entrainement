import { useEffect, useState, type CSSProperties } from 'react';
import { Figure } from '../components/Figure';
import { ATHLETE, exerciseCount, KIND_LABEL, sessionsFor, SPEED_PER_WEEK, weekInfo, type Session } from '../data/programme';
import { addDays, capitalize, dayAndMonth, mondayOf, todayKey, weekday, weekdayName } from '../lib/dates';
import { go, href } from '../lib/router';
import { BED_TARGET, formatHours, formatKg, nightMinutes, SLEEP_ID, speedCount, WAKE_TARGET, WEIGHT_GOAL, WEIGHT_ID, weights } from '../lib/stats';
import { getEntry, updateEntry, useStore, type Entries } from '../lib/store';
import { Icon, kindStyle } from '../ui';
import { resumableSession } from './Player';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Bonne nuit';
  if (hour < 18) return 'Bonjour';
  return 'Bonsoir';
}

const guided = (s: Session) => exerciseCount(s) > 0;

export function Today() {
  const { entries } = useStore();
  const today = todayKey();
  const info = weekInfo(today);
  const monday = mondayOf(today);
  const sessions = sessionsFor(today);
  const resumable = resumableSession(today);
  const [sheet, setSheet] = useState(false);
  const isDone = (s: Session) => getEntry(entries, today, s.id).done;
  // La séance mise en avant : la première séance d'entraînement pas encore faite, sinon ce qui reste.
  const main = sessions.find((s) => s.kind !== 'mobilite' && !isDone(s)) ?? sessions.find((s) => !isDone(s));
  const others = sessions.filter((s) => s !== main);
  const wd = weekday(today);
  const bilanMonday = wd === 6 ? monday : wd === 0 ? addDays(monday, -7) : null;
  const showBilan = bilanMonday !== null && weekInfo(bilanMonday).started;
  const todo = quickTodo(entries, today);
  const count = main ? exerciseCount(main) : 0;

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

      <p className="eyebrow">{main ? (main.kind === 'mobilite' ? 'À faire' : 'Séance du jour') : 'Aujourd’hui'}</p>
      {main ? (
        <section className="hero-card" style={kindStyle(main.kind)}>
          <a className="hero-figure" href={href('seance', today, main.id)} aria-label={`Voir le détail : ${main.title}`}>
            <Figure anim={main.anim} playing label="" />
          </a>
          <p className="hero-kind">
            {KIND_LABEL[main.kind]}
            {info.started && main.kind !== 'mobilite' ? ` · ${info.bloc.name}, semaine ${info.w + 1}` : ''}
            {info.light && main.kind !== 'mobilite' ? ' · tests' : ''}
          </p>
          <h2 className="hero-name">{main.title}</h2>
          <p className="hero-meta">
            {main.minutes} min
            {count > 0 ? ` · ${count} exercice${count > 1 ? 's' : ''}` : ''}
          </p>
          <button type="button" className="button primary big" onClick={() => (guided(main) ? go('go', today, main.id) : go('seance', today, main.id))}>
            <Icon name="play" size={18} />
            {resumable === main.id ? 'Reprendre' : guided(main) ? 'Démarrer' : 'Ouvrir'}
          </button>
          <a className="hero-more" href={href('seance', today, main.id)}>
            Voir le détail
          </a>
        </section>
      ) : (
        <section className="hero-card is-complete">
          <span className="complete-badge">
            <Icon name="check" size={28} />
          </span>
          <h2 className="hero-name">{sessions.length ? 'Journée complète' : 'Journée de repos'}</h2>
          <p className="hero-meta">{sessions.length ? 'Tout est fait. Bon golf cet après-midi.' : 'Récupère, et profite du golf.'}</p>
        </section>
      )}

      {others.length > 0 && (
        <ul className="mini-list">
          {others.map((s) => {
            const done = isDone(s);
            return (
              <li key={s.id}>
                <a href={href('seance', today, s.id)} className={done ? 'is-done' : ''} style={kindStyle(s.kind)}>
                  <span className="mini-check">{done ? <Icon name="check" size={16} /> : null}</span>
                  <span className="mini-title">{s.title}</span>
                  <span className="mini-meta">{s.minutes} min</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {showBilan && bilanMonday && (
        <a className="row-link" href={href('bilan', bilanMonday)}>
          <span className="row-text">
            <span className="row-title">{wd === 6 ? 'Ton bilan de la semaine' : 'Le bilan de la semaine dernière'}</span>
            <span className="row-sub">Régularité, sommeil, poids et ajustements</span>
          </span>
          <Icon name="next" size={18} />
        </a>
      )}

      <button type="button" className="fab" onClick={() => setSheet(true)} aria-label={`Noter ma nuit, mon poids ou ma vitesse${todo > 0 ? ` (${todo} à faire)` : ''}`}>
        <Icon name="plus" size={26} />
        {todo > 0 && <span className="fab-dot" aria-hidden="true" />}
      </button>

      {sheet && <QuickSheet day={today} monday={monday} entries={entries} started={info.started} onClose={() => setSheet(false)} />}
    </main>
  );
}

function quickTodo(entries: Entries, day: string) {
  const monday = mondayOf(day);
  let n = 0;
  if (!getEntry(entries, day, SLEEP_ID).data.wake) n++;
  if (weekInfo(day).started && weights(entries).every((p) => p.day < monday)) n++;
  return n;
}

type Panel = 'menu' | 'nuit' | 'poids';

const qStyle = (color: string) => ({ '--q': `var(--${color})` }) as CSSProperties;

function QuickSheet({ day, monday, entries, started, onClose }: { day: string; monday: string; entries: Entries; started: boolean; onClose: () => void }) {
  const [panel, setPanel] = useState<Panel>('menu');
  const sleep = getEntry(entries, day, SLEEP_ID);
  const all = weights(entries);
  const last = all[all.length - 1];
  const weighed = all.some((p) => p.day >= monday);
  const speed = speedCount(entries, monday);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-wrap">
      <button type="button" className="sheet-backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Noter">
        <span className="sheet-grip" aria-hidden="true" />
        {panel === 'menu' && (
          <>
            <p className="sheet-title">Noter</p>
            <button type="button" className="quick-row" style={qStyle('nuit')} onClick={() => setPanel('nuit')}>
              <span className="quick-icon">
                <Icon name="moon" />
              </span>
              <span className="quick-text">
                <span className="quick-name">Ma nuit</span>
                <span className="quick-sub">{sleep.data.wake ? `${formatHours(nightMinutes(sleep.data.bed ?? BED_TARGET, sleep.data.wake))}, notée` : 'Couché à minuit, levé à 8 h ?'}</span>
              </span>
              {!sleep.data.wake && <span className="quick-tag">À faire</span>}
            </button>
            <button type="button" className="quick-row" style={qStyle('poids')} onClick={() => setPanel('poids')}>
              <span className="quick-icon">
                <Icon name="scale" />
              </span>
              <span className="quick-text">
                <span className="quick-name">Mon poids</span>
                <span className="quick-sub">{last ? `Dernier : ${formatKg(last.value)}, objectif ${WEIGHT_GOAL} kg` : `Objectif ${WEIGHT_GOAL} kg en mars`}</span>
              </span>
              {started && !weighed && <span className="quick-tag">Cette semaine</span>}
            </button>
            <button type="button" className="quick-row" style={qStyle('vitesse')} onClick={() => go('seance', day, 'vitesse')}>
              <span className="quick-icon">
                <Icon name="golf" />
              </span>
              <span className="quick-text">
                <span className="quick-name">Vitesse de swing</span>
                <span className="quick-sub">
                  Au practice · {speed} sur {SPEED_PER_WEEK} cette semaine
                </span>
              </span>
            </button>
            <button type="button" className="button ghost" onClick={onClose}>
              Fermer
            </button>
          </>
        )}
        {panel === 'nuit' && <SleepForm day={day} onDone={onClose} onBack={() => setPanel('menu')} />}
        {panel === 'poids' && <WeightForm day={day} onDone={onClose} onBack={() => setPanel('menu')} />}
      </div>
    </div>
  );
}

const TIME_RE = /^\d{2}:\d{2}$/;

function SheetHead({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sheet-head">
      <button type="button" className="icon-button" onClick={onBack} aria-label="Retour">
        <Icon name="back" />
      </button>
      <p className="sheet-title">{title}</p>
    </div>
  );
}

function SleepForm({ day, onDone, onBack }: { day: string; onDone: () => void; onBack: () => void }) {
  const [bed, setBed] = useState(BED_TARGET);
  const [wake, setWake] = useState(WAKE_TARGET);
  const valid = TIME_RE.test(bed) && TIME_RE.test(wake);
  const save = (b: string, w: string) => {
    updateEntry(day, SLEEP_ID, { done: true, data: { bed: b, wake: w } });
    onDone();
  };
  return (
    <>
      <SheetHead title="Ma nuit" onBack={onBack} />
      <button type="button" className="button primary big" onClick={() => save(BED_TARGET, WAKE_TARGET)}>
        Minuit, 8 h : c’est ça
      </button>
      <p className="sheet-or">ou corrige les heures</p>
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
      <button type="button" className="button" disabled={!valid} onClick={() => save(bed, wake)}>
        Enregistrer {valid ? formatHours(nightMinutes(bed, wake)) : ''}
      </button>
    </>
  );
}

function WeightForm({ day, onDone, onBack }: { day: string; onDone: () => void; onBack: () => void }) {
  const [text, setText] = useState('');
  const value = Number(text.replace(',', '.'));
  const valid = text.trim() !== '' && Number.isFinite(value) && value > 30 && value < 200;
  return (
    <>
      <SheetHead title="Mon poids" onBack={onBack} />
      <p className="muted small">Le matin, à jeun, une fois par semaine, le lundi idéalement.</p>
      <div className="inline-form">
        <label className="field">
          <span className="sr-only">Poids en kg</span>
          <input inputMode="decimal" placeholder="66,4" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <span className="unit">kg</span>
      </div>
      <button
        type="button"
        className="button primary big"
        disabled={!valid}
        onClick={() => {
          updateEntry(day, WEIGHT_ID, { done: true, data: { value: Math.round(value * 10) / 10 } });
          onDone();
        }}
      >
        Enregistrer
      </button>
    </>
  );
}
