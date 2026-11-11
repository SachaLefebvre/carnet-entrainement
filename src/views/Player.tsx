import { useEffect, useMemo, useRef, useState } from 'react';
import { Figure } from '../components/Figure';
import { EXERCISES } from '../data/exercises';
import { findSession, type Item, type Phase, type Session } from '../data/programme';
import { back, replace } from '../lib/router';
import { beep, buzz, keepAwake } from '../lib/sound';
import { formatClock, formatMinutes } from '../lib/stats';
import { getEntry, updateEntry, useStore } from '../lib/store';
import { Icon, kindStyle, Ring } from '../ui';

// Le mode guidé : un exercice à la fois, avec le compte des séries et les chronos.
// La progression est gardée sur l'appareil, pour reprendre si le téléphone ferme l'app.

type Step =
  | { type: 'work'; item: Item; block: string; set: number; side?: string }
  | { type: 'rest'; seconds: number }
  | { type: 'phase'; phase: Phase; number: number; total: number };

interface Saved {
  day: string;
  id: string;
  index: number;
  startedAt: number;
  finishedAt?: number;
  sets: Record<string, number[]>;
}

const LS_PLAYER = 'tdb.player.v1';

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(LS_PLAYER);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function store(saved: Saved | null) {
  try {
    if (saved) localStorage.setItem(LS_PLAYER, JSON.stringify(saved));
    else localStorage.removeItem(LS_PLAYER);
  } catch {
    // Stockage indisponible : la séance continue sans reprise possible.
  }
}

/** Identifiant de la séance commencée ce jour-là et pas terminée, s'il y en a une. */
export function resumableSession(day: string): string | null {
  const saved = loadSaved();
  return saved && saved.day === day && saved.index > 0 ? saved.id : null;
}

export function buildSteps(session: Session): Step[] {
  if (session.phases) return session.phases.map((phase, i, all) => ({ type: 'phase', phase, number: i + 1, total: all.length }));
  const items = session.blocks.flatMap((block) => block.items.map((item) => ({ item, block: block.title })));
  const steps: Step[] = [];
  items.forEach(({ item, block }, i) => {
    for (let set = 1; set <= item.sets; set += 1) {
      // Une tenue par côté se chronomètre deux fois.
      const sides = item.hold && item.perSide ? ['Côté gauche', 'Côté droit'] : [undefined];
      for (const side of sides) steps.push({ type: 'work', item, block, set, side });
      const isLast = i === items.length - 1 && set === item.sets;
      if (item.rest > 0 && !isLast) steps.push({ type: 'rest', seconds: item.rest });
    }
  });
  return steps;
}

/** Compte à rebours calé sur l'horloge, pour rester juste même si l'app passe en arrière-plan. */
function useCountdown(key: unknown, seconds: number, autoStart: boolean, onDone: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(autoStart);
  const endAt = useRef(0);
  const lastBeep = useRef(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
    setRunning(autoStart);
    endAt.current = Date.now() + seconds * 1000;
    lastBeep.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000);
      setRemaining(left);
      const whole = Math.ceil(left);
      if (whole <= 3 && whole >= 1 && whole !== lastBeep.current) {
        lastBeep.current = whole;
        beep(660, 90);
      }
      if (left <= 0) {
        clearInterval(timer);
        setRunning(false);
        beep(990, 320);
        buzz([120, 60, 120]);
        done.current();
      }
    }, 200);
    return () => clearInterval(timer);
  }, [running, key]);

  return {
    remaining,
    running,
    start: () => {
      endAt.current = Date.now() + remaining * 1000;
      setRunning(true);
    },
    pause: () => setRunning(false),
    add: (extra: number) => {
      endAt.current += extra * 1000;
      setRemaining((r) => r + extra);
    },
  };
}

function target(item: Item): string {
  if (item.label) return item.label;
  return `${item.reps} répétition${(item.reps ?? 0) > 1 ? 's' : ''}${item.perSide ? ' par côté' : ''}`;
}

export function Player({ day, id }: { day: string; id: string }) {
  const { entries } = useStore();
  const session = findSession(day, id);
  const steps = useMemo(() => (session ? buildSteps(session) : []), [session?.id, day]);
  const [state, setState] = useState<Saved>(() => {
    const saved = loadSaved();
    return saved && saved.day === day && saved.id === id ? saved : { day, id, index: 0, startedAt: Date.now(), sets: {} };
  });
  const [now, setNow] = useState(Date.now());
  const [note, setNote] = useState(() => getEntry(entries, day, id).note);

  useEffect(() => keepAwake(), []);
  useEffect(() => store(state), [state]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session || steps.length === 0) {
    return (
      <main className="screen">
        <p className="muted">Cette séance n’a pas de mode guidé.</p>
        <button type="button" className="button" onClick={() => back(['seance', day, id])}>
          Revenir à la séance
        </button>
      </main>
    );
  }

  const finished = state.index >= steps.length;
  const step = steps[Math.min(state.index, steps.length - 1)];
  const elapsed = ((state.finishedAt ?? now) - state.startedAt) / 1000;

  const advance = (record?: { ex: string; value: number }) =>
    setState((s) => {
      const index = s.index + 1;
      const sets = record ? { ...s.sets, [record.ex]: [...(s.sets[record.ex] ?? []), record.value] } : s.sets;
      return { ...s, index, sets, finishedAt: index >= steps.length ? Date.now() : undefined };
    });

  const previous = () =>
    setState((s) => {
      const index = s.index - 1;
      if (index < 0) return s;
      const prev = steps[index];
      const sets = { ...s.sets };
      // En revenant sur une série, on retire ce qui avait été noté pour elle.
      if (prev.type === 'work') sets[prev.item.ex] = (sets[prev.item.ex] ?? []).slice(0, -1);
      return { ...s, index, sets, finishedAt: undefined };
    });

  const save = () => {
    const entry = getEntry(entries, day, id);
    const sets = Object.fromEntries(Object.entries(state.sets).filter(([, values]) => values.length > 0));
    updateEntry(day, id, { done: true, note, data: { ...entry.data, durationSec: Math.round(elapsed), sets } });
    store(null);
    replace('seance', day, id);
  };

  if (finished) {
    const setCount = Object.values(state.sets).reduce((n, values) => n + values.length, 0);
    return (
      <main className="player is-finished" style={kindStyle(session.kind)}>
        <div className="finish">
          <span className="finish-badge">
            <Icon name="check" size={44} />
          </span>
          <h1>Séance terminée</h1>
          <p className="muted">{session.title}</p>
          <dl className="facts">
            <div>
              <dt>Durée</dt>
              <dd className="num">{formatMinutes(elapsed)}</dd>
            </div>
            {setCount > 0 && (
              <div>
                <dt>Séries</dt>
                <dd className="num">{setCount}</dd>
              </div>
            )}
            <div>
              <dt>Étapes</dt>
              <dd className="num">{steps.length}</dd>
            </div>
          </dl>
          <label className="field">
            <span>Une note sur la séance ?</span>
            <textarea rows={3} value={note} placeholder="Sensations, difficultés, ce que tu veux retenir" onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
        <div className="player-actions">
          <button type="button" className="button primary" onClick={save}>
            Enregistrer la séance
          </button>
          <button type="button" className="button ghost" onClick={previous}>
            Revenir à la dernière étape
          </button>
        </div>
      </main>
    );
  }

  const nextWork = steps.slice(state.index + 1).find((s) => s.type === 'work') as Extract<Step, { type: 'work' }> | undefined;

  return (
    <main className={`player${step.type === 'rest' ? ' is-rest' : ''}`} style={kindStyle(session.kind)}>
      <header className="player-top">
        <button type="button" className="icon-button" onClick={() => back(['seance', day, id])} aria-label="Quitter la séance, la progression est gardée">
          <Icon name="close" />
        </button>
        <div className="player-progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={state.index} aria-label="Avancement de la séance">
          <span style={{ width: `${(state.index / steps.length) * 100}%` }} />
        </div>
        <span className="player-clock num">{formatClock(elapsed)}</span>
      </header>

      {step.type === 'work' && <WorkStep key={state.index} step={step} onDone={advance} />}
      {step.type === 'rest' && <RestStep key={state.index} seconds={step.seconds} next={nextWork} onDone={() => advance()} />}
      {step.type === 'phase' && <PhaseStep key={state.index} step={step} first={state.index === 0} anim={session.anim} onDone={() => advance()} />}

      <footer className="player-foot">
        <button type="button" className="text-link as-button" onClick={previous} disabled={state.index === 0}>
          Étape précédente
        </button>
        <span className="muted num">
          {state.index + 1} sur {steps.length}
        </span>
      </footer>
    </main>
  );
}

function WorkStep({ step, onDone }: { step: Extract<Step, { type: 'work' }>; onDone: (record?: { ex: string; value: number }) => void }) {
  const { item } = step;
  const exercise = EXERCISES[item.ex];
  const [reps, setReps] = useState(item.reps ?? 0);
  const [help, setHelp] = useState(false);
  const hold = item.hold ?? 0;
  const timer = useCountdown(`${item.ex}-${step.set}-${step.side}`, hold, false, () => onDone({ ex: item.ex, value: hold }));
  const started = hold > 0 && (timer.running || timer.remaining < hold);

  return (
    <>
      <div className="stage">
        <Figure anim={exercise.anim} playing label={`Démonstration : ${exercise.name}`} />
      </div>
      <div className="player-body">
        <p className="overline">{step.block}</p>
        <h1>{exercise.name}</h1>
        <p className="set-line">
          {item.sets > 1 ? `Série ${step.set} sur ${item.sets}` : 'Une seule série'}
          {step.side ? `, ${step.side.toLowerCase()}` : ''}
        </p>

        {hold > 0 ? (
          <div className="timer-row">
            <Ring value={timer.remaining / hold} size={150} stroke={10} label={`${Math.ceil(timer.remaining)} secondes restantes`}>
              <span className="ring-big num">{Math.ceil(timer.remaining)}</span>
              <span className="ring-unit">secondes</span>
            </Ring>
          </div>
        ) : (
          <>
            <p className="target">{target(item)}</p>
            {item.note && <p className="muted">{item.note}</p>}
          </>
        )}

        <button type="button" className="text-link as-button" aria-expanded={help} onClick={() => setHelp(!help)}>
          {help ? 'Masquer les consignes' : 'Voir les consignes'}
        </button>
        {help && (
          <div className="help">
            <ol>
              {exercise.steps.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ol>
            <p>
              <strong>À éviter.</strong> {exercise.avoid}
            </p>
          </div>
        )}
      </div>

      <div className="player-actions">
        {hold > 0 ? (
          !started ? (
            <button type="button" className="button primary" onClick={timer.start}>
              <Icon name="play" size={20} />
              Lancer le chrono
            </button>
          ) : (
            <button type="button" className="button" onClick={() => onDone({ ex: item.ex, value: Math.round(hold - timer.remaining) })}>
              Arrêter à {Math.round(hold - timer.remaining)} s
            </button>
          )
        ) : (
          <>
            {item.reps !== undefined && !item.label && (
              <div className="stepper-row">
                <span className="stepper-label">Répétitions faites{item.perSide ? ' par côté' : ''}</span>
                <div className="count-stepper">
                  <button type="button" className="icon-button" onClick={() => setReps(Math.max(0, reps - 1))} aria-label="Une répétition de moins">
                    <Icon name="minus" />
                  </button>
                  <span className="count num" aria-live="polite">
                    {reps}
                  </span>
                  <button type="button" className="icon-button" onClick={() => setReps(reps + 1)} aria-label="Une répétition de plus">
                    <Icon name="plus" />
                  </button>
                </div>
              </div>
            )}
            <button type="button" className="button primary" onClick={() => onDone({ ex: item.ex, value: reps })}>
              {item.sets > 1 ? 'Série terminée' : 'Exercice terminé'}
            </button>
          </>
        )}
        {hold > 0 && !started && (
          <button type="button" className="button ghost" onClick={() => onDone()}>
            Passer
          </button>
        )}
      </div>
    </>
  );
}

function RestStep({ seconds, next, onDone }: { seconds: number; next?: Extract<Step, { type: 'work' }>; onDone: () => void }) {
  const timer = useCountdown('rest', seconds, true, onDone);
  const total = Math.max(seconds, timer.remaining);
  const exercise = next ? EXERCISES[next.item.ex] : undefined;
  return (
    <>
      <div className="player-body is-centered">
        <p className="overline">Repos</p>
        <Ring value={timer.remaining / total} size={210} stroke={12} label={`${Math.ceil(timer.remaining)} secondes de repos restantes`}>
          <span className="ring-huge num">{formatClock(Math.ceil(timer.remaining))}</span>
        </Ring>
        {exercise && next && (
          <div className="next-up">
            <div className="next-thumb">
              <Figure anim={exercise.anim} label="" />
            </div>
            <div>
              <p className="muted">Ensuite</p>
              <p className="next-name">{exercise.name}</p>
              <p className="muted">{next.item.sets > 1 ? `Série ${next.set} sur ${next.item.sets}` : 'Une série'}</p>
            </div>
          </div>
        )}
      </div>
      <div className="player-actions is-row">
        <button type="button" className="button" onClick={() => timer.add(15)}>
          + 15 s
        </button>
        <button type="button" className="button primary" onClick={onDone}>
          Passer le repos
        </button>
      </div>
    </>
  );
}

function PhaseStep({ step, first, anim, onDone }: { step: Extract<Step, { type: 'phase' }>; first: boolean; anim: string; onDone: () => void }) {
  const { phase } = step;
  // La première phase attend ton départ ; les suivantes s'enchaînent seules.
  const timer = useCountdown(step.number, phase.seconds, !first, onDone);
  const started = timer.running || timer.remaining < phase.seconds;
  return (
    <>
      <div className={`player-body is-centered${phase.fast ? ' is-fast' : ''}`}>
        <p className="overline">
          Phase {step.number} sur {step.total}
        </p>
        <h1>{phase.label}</h1>
        <Ring value={timer.remaining / phase.seconds} size={220} stroke={12} label={`${formatClock(timer.remaining)} restantes`}>
          <span className="ring-huge num">{formatClock(Math.ceil(timer.remaining))}</span>
        </Ring>
        <div className="phase-figure">
          <Figure anim={phase.fast ? 'sprint' : anim === 'sprint' ? 'run' : anim} playing={timer.running} label="" />
        </div>
        <p className="muted small">Garde l’écran allumé pour entendre les signaux de changement de phase.</p>
      </div>
      <div className="player-actions is-row">
        {timer.running ? (
          <button type="button" className="button" onClick={timer.pause}>
            <Icon name="pause" size={20} />
            Pause
          </button>
        ) : (
          <button type="button" className="button primary" onClick={timer.start}>
            <Icon name="play" size={20} />
            {started ? 'Reprendre' : 'Démarrer'}
          </button>
        )}
        <button type="button" className="button ghost" onClick={onDone}>
          Phase suivante
        </button>
      </div>
    </>
  );
}
