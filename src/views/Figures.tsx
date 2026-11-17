import { useState, type CSSProperties } from 'react';
import { Figure } from '../components/Figure';
import { EXERCISES } from '../data/exercises';
import { SKILLS, SKILL_BY_ID, type Skill } from '../data/skills';
import { dayAndMonth, shortDate } from '../lib/dates';
import { href, replace } from '../lib/router';
import { goalText, logsOf, priorities, setSkill, skillState, stepProgress, type SessionLog, type SkillState } from '../lib/skills';
import { useStore, type Entries } from '../lib/store';
import { kindStyle, Segmented, TopBar } from '../ui';

type Tab = 'progression' | 'diagnostic' | 'comprendre' | 'exercices';

const TABS: { id: Tab; label: string }[] = [
  { id: 'progression', label: 'Progression' },
  { id: 'diagnostic', label: 'Diagnostic' },
  { id: 'comprendre', label: 'Comprendre' },
  { id: 'exercices', label: 'Exercices' },
];

/** Où la figure se travaille dans la semaine (voir programme.ts). */
const PLACEMENT: Record<string, string> = {
  lsit: 'Séance principale le jeudi, rappels le lundi et le vendredi.',
  poirier: 'Séance principale le lundi, rappels le mercredi et le jeudi.',
  pistol: 'Séance principale le mercredi, rappel le vendredi.',
};

/** Couleur d'un verrou, toujours accompagnée de son nom. */
const lockStyle = (skill: Skill, lockId: string) => ({ '--lc': `var(--lock-${skill.locks.findIndex((l) => l.id === lockId)})` }) as CSSProperties;

function LockChip({ skill, lockId }: { skill: Skill; lockId: string }) {
  const lock = skill.locks.find((l) => l.id === lockId);
  return (
    <span className="lock-chip" style={lockStyle(skill, lockId)}>
      {lock?.name}
    </span>
  );
}

function StepDots({ total, level }: { total: number; level: number }) {
  return (
    <span className="step-dots" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < level ? 'is-done' : i === level ? 'is-current' : ''} />
      ))}
    </span>
  );
}

export function Figures() {
  const { entries } = useStore();
  return (
    <main className="screen" style={kindStyle('muscu')}>
      <header className="page-head">
        <div>
          <p className="overline">Callisthénie</p>
          <h1>Figures</h1>
        </div>
      </header>
      <p className="lead">Chaque figure avance par étapes. Dès que tu réussis l’objectif d’une étape en séance, l’app te propose de passer à la suivante.</p>
      <div className="stack figure-list">
        {SKILLS.map((skill) => (
          <SkillCard key={skill.id} skill={skill} entries={entries} />
        ))}
      </div>
    </main>
  );
}

export function SkillCard({ skill, entries, compact }: { skill: Skill; entries: Entries; compact?: boolean }) {
  const state = skillState(entries, skill);
  const progress = stepProgress(entries, skill, state);
  const { step } = progress;
  return (
    <a className={`skill-card${compact ? ' is-compact' : ''}`} href={href('figure', skill.id)}>
      <div className="session-thumb">
        <Figure anim={step.anim} label="" />
      </div>
      <div className="skill-text">
        <span className="session-kind">
          Étape {state.level + 1} sur {skill.steps.length}
        </span>
        <span className="session-title">{skill.name}</span>
        <span className="session-meta">
          {step.name}, objectif {goalText(step)}
        </span>
        <StepDots total={skill.steps.length} level={state.level} />
        {progress.ready ? (
          <span className="ready-tag">{progress.last ? 'Figure maîtrisée' : 'Prêt pour l’étape suivante'}</span>
        ) : !state.diagnosed ? (
          <span className="todo-tag">Diagnostic à faire</span>
        ) : (
          <span className="mini-progress">
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(progress.bestGood / progress.required) * 100}%` }} />
            </span>
            <span className="num">
              {progress.bestGood}/{progress.required}
            </span>
          </span>
        )}
      </div>
    </a>
  );
}

export function SkillPage({ id, tab: routeTab }: { id: string; tab?: string }) {
  const { entries } = useStore();
  const skill = SKILL_BY_ID[id];
  if (!skill) {
    return (
      <main className="screen">
        <TopBar title="Figures" fallback={['figures']} />
        <p className="muted">Cette figure n’existe pas.</p>
      </main>
    );
  }
  const tab: Tab = TABS.some((t) => t.id === routeTab) ? (routeTab as Tab) : 'progression';
  const state = skillState(entries, skill);

  return (
    <main className="screen" style={kindStyle('muscu')}>
      <TopBar title="Figures" fallback={['figures']} />
      <section className="cover">
        <div className="cover-figure">
          <Figure anim={skill.anim} playing label={`Illustration : ${skill.name}`} />
        </div>
        <p className="session-kind">Callisthénie</p>
        <h1>{skill.name}</h1>
        <p className="muted">{skill.tagline}</p>
      </section>
      <Segmented options={TABS} value={tab} onChange={(next) => replace('figure', skill.id, next)} label="Rubrique" />
      {tab === 'progression' && <ProgressTab skill={skill} entries={entries} state={state} />}
      {tab === 'diagnostic' && <DiagnosticTab key={state.diagnosed ?? 'none'} skill={skill} state={state} />}
      {tab === 'comprendre' && <LearnTab skill={skill} />}
      {tab === 'exercices' && <ExercisesTab skill={skill} state={state} />}
    </main>
  );
}

function ProgressTab({ skill, entries, state }: { skill: Skill; entries: Entries; state: SkillState }) {
  const [confirm, setConfirm] = useState<number | null>(null);
  const progress = stepProgress(entries, skill, state);
  const { step } = progress;
  const next = skill.steps[state.level + 1];
  const unit = step.metric === 'hold' ? 's' : '';
  const reachedOn = (i: number) => [...state.history].reverse().find((h) => h.level === i)?.day;
  const successDay = progress.logs.find((log) => log.good >= progress.required)?.day;

  return (
    <>
      {!state.diagnosed && (
        <section className="callout">
          <p className="callout-title">Commence par le diagnostic</p>
          <p>Trois tests rapides, deux minutes en tout : ils te placent à la bonne étape et choisissent les exercices qui débloquent ton point faible.</p>
          <button type="button" className="button" onClick={() => replace('figure', skill.id, 'diagnostic')}>
            Faire le diagnostic
          </button>
        </section>
      )}

      {progress.ready && (
        <section className="panel ready-panel">
          {progress.last ? (
            <>
              <p className="panel-head">Figure maîtrisée</p>
              <p className="muted">Tu as réussi la dernière étape. Garde-la en entretien, ou passe à une variante plus dure : {step.tip.replace(/^Ensuite : /, '')}</p>
            </>
          ) : (
            <>
              <p className="panel-head">Objectif atteint{successDay ? ` le ${dayAndMonth(successDay)}` : ''}</p>
              <p className="muted">
                Tu peux passer à l’étape {state.level + 2} : <strong className="text-strong">{next.name}</strong>. Tes séances s’adapteront dès aujourd’hui.
              </p>
              <button type="button" className="button primary" onClick={() => setSkill(skill, { level: state.level + 1 })}>
                Passer à « {next.name} »
              </button>
              <button type="button" className="button ghost" onClick={() => setSkill(skill, { level: state.level })}>
                Rester à cette étape pour l’instant
              </button>
              <p className="hint">Rester relance le compteur : l’app te le reproposera quand tu auras de nouveau réussi l’objectif.</p>
            </>
          )}
        </section>
      )}

      <h2 className="section-title">Ton étape</h2>
      <section className="panel current-step">
        <div className="stage">
          <Figure anim={step.anim} playing label={`Démonstration : ${step.name}`} />
        </div>
        <p className="overline">
          Étape {state.level + 1} sur {skill.steps.length}
          {state.since ? `, depuis le ${dayAndMonth(state.since)}` : ''}
        </p>
        <h2 className="step-name">{step.name}</h2>
        <p className="muted">{step.what}</p>
        <div className="chips">
          <span className="chip">Objectif : {goalText(step)}</span>
          {step.load ? <span className="chip">Charge sur les hanches : {step.load} %</span> : null}
        </div>
        <div className="goal-progress">
          <p className="readout">
            {progress.logs.length === 0 ? (
              'Pas encore de séance à cette étape.'
            ) : (
              <>
                Meilleure séance : <strong className="num">{progress.bestGood}</strong> série{progress.bestGood > 1 ? 's' : ''} sur{' '}
                <span className="num">{progress.required}</span> à {step.target}
                {unit ? ` ${unit}` : ''} ou plus
                {step.perSide && step.metric === 'hold' ? ' (chaque côté compte)' : ''}.
              </>
            )}
          </p>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${Math.min(1, progress.bestGood / progress.required) * 100}%` }} />
          </span>
        </div>
        <p className="panel-foot">{step.tip}</p>
        <a className="text-link" href={href('exercice', step.ex)}>
          Voir les consignes de l’exercice
        </a>
      </section>

      <h2 className="section-title">Ton évolution</h2>
      <section className="panel">
        <SkillChart logs={logsOf(entries, step.ex, step.target)} target={step.target} unit={unit} name={EXERCISES[step.ex]?.name ?? step.name} />
      </section>

      <h2 className="section-title">Ton parcours</h2>
      <ol className="ladder">
        {skill.steps.map((s, i) => {
          const status = i < state.level ? 'is-done' : i === state.level ? 'is-current' : 'is-next';
          const day = reachedOn(i);
          return (
            <li key={i} className={status}>
              <span className="ladder-dot num">{i + 1}</span>
              <div className="ladder-thumb">
                <Figure anim={s.anim} label="" />
              </div>
              <div className="ladder-text">
                <span className="ladder-name">{s.name}</span>
                <span className="ladder-meta">
                  {goalText(s)}
                  {i === state.level ? ', en cours' : i < state.level ? (day ? `, atteinte le ${shortDate(day)}` : ', acquise') : ''}
                </span>
                {confirm === i ? (
                  <span className="ladder-confirm">
                    <button
                      type="button"
                      className="text-link as-button"
                      onClick={() => {
                        setSkill(skill, { level: i });
                        setConfirm(null);
                      }}
                    >
                      Confirmer
                    </button>
                    <button type="button" className="text-link as-button muted-link" onClick={() => setConfirm(null)}>
                      Annuler
                    </button>
                  </span>
                ) : (
                  i !== state.level && (
                    <button type="button" className="text-link as-button muted-link" onClick={() => setConfirm(i)}>
                      {i < state.level ? 'Revenir à cette étape' : 'Choisir cette étape'}
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="hint">{PLACEMENT[skill.id]} Les exercices changent tout seuls quand tu changes d’étape.</p>
    </>
  );
}

/** Meilleure tenue (ou série) de chaque séance, avec la ligne de l'objectif. */
function SkillChart({ logs, target, unit, name }: { logs: SessionLog[]; target: number; unit: string; name: string }) {
  const shown = logs.slice(-12);
  const [index, setIndex] = useState(shown.length - 1);
  if (shown.length === 0) {
    return <p className="muted">Ta courbe apparaîtra après ta première séance en mode guidé. Chaque point sera ta meilleure série de la séance, comparée à l’objectif.</p>;
  }
  const active = Math.min(Math.max(index, 0), shown.length - 1);
  const W = 320;
  const H = 150;
  const left = 30;
  const right = 12;
  const top = 14;
  const bottom = 22;
  const max = Math.max(target * 1.25, ...shown.map((l) => l.best));
  const x = (i: number) => (shown.length === 1 ? (left + W - right) / 2 : left + (i * (W - left - right)) / (shown.length - 1));
  const y = (v: number) => top + (1 - v / max) * (H - top - bottom);
  const fmt = (v: number) => `${v}${unit ? ` ${unit}` : ''}`;
  const current = shown[active];

  return (
    <div className="skill-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Meilleure série de chaque séance : ${name}`}>
        <line className="chart-axis" x1={left} x2={W - right} y1={y(0)} y2={y(0)} />
        <text className="chart-tick" x={left - 6} y={y(0) + 4} textAnchor="end">
          0
        </text>
        <line className="chart-goal" x1={left} x2={W - right} y1={y(target)} y2={y(target)} />
        <text className="chart-tick" x={left - 6} y={y(target) + 4} textAnchor="end">
          {target}
        </text>
        <text className="chart-goal-label" x={left + 4} y={y(target) - 6} textAnchor="start">
          objectif
        </text>
        {shown.length > 1 && <polyline className="spark-line" points={shown.map((l, i) => `${x(i)},${y(l.best)}`).join(' ')} />}
        {shown.map((l, i) => (
          <g key={l.day}>
            <circle className={`spark-dot${i === active ? ' is-active' : ''}${l.best >= target ? ' is-goal' : ''}`} cx={x(i)} cy={y(l.best)} r={i === active ? 6 : 4.5} />
            <rect
              className="spark-hit"
              x={x(i) - 14}
              y={0}
              width={28}
              height={H}
              onMouseEnter={() => setIndex(i)}
              onClick={() => setIndex(i)}
              aria-label={`${shortDate(l.day)} : meilleure série ${fmt(l.best)}`}
            />
          </g>
        ))}
        <text className="chart-tick" x={x(0)} y={H - 4} textAnchor={shown.length === 1 ? 'middle' : 'start'}>
          {shortDate(shown[0].day)}
        </text>
        {shown.length > 1 && (
          <text className="chart-tick" x={x(shown.length - 1)} y={H - 4} textAnchor="end">
            {shortDate(shown[shown.length - 1].day)}
          </text>
        )}
      </svg>
      <p className="readout" aria-live="polite">
        {shortDate(current.day)} : meilleure série <strong className="num">{fmt(current.best)}</strong>
        <span className="muted"> (séries : {current.values.join(' / ')})</span>
      </p>
    </div>
  );
}

function DiagnosticTab({ skill, state }: { skill: Skill; state: SkillState }) {
  const [answers, setAnswers] = useState<Record<string, number>>(state.answers);
  const [saved, setSaved] = useState(false);
  const start = skill.startStep(answers);
  const startStep = skill.steps[start];
  const order = priorities(skill, answers);

  const save = (withLevel: boolean) => {
    setSkill(skill, { answers, level: withLevel ? start : state.since ? undefined : state.level });
    setSaved(true);
  };

  return (
    <>
      <p className="lead">
        Fais ces trois tests, frais, et choisis ce qui te correspond. Refais-les toutes les quatre semaines : les exercices d’assistance suivent tes réponses.
        {state.diagnosed ? ` Dernier diagnostic le ${dayAndMonth(state.diagnosed)}.` : ''}
      </p>
      <div className="stack">
        {skill.questions.map((question) => (
          <section key={question.lock} className="panel question" style={lockStyle(skill, question.lock)}>
            <LockChip skill={skill} lockId={question.lock} />
            <p className="question-text">{question.q}</p>
            <p className="muted small">{question.hint}</p>
            <div className="options" role="group" aria-label={question.q}>
              {question.options.map((label, value) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={answers[question.lock] === value}
                  onClick={() => {
                    setAnswers({ ...answers, [question.lock]: value });
                    setSaved(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <h2 className="section-title">Ton plan</h2>
      <section className="panel">
        <p>
          Étape de départ : <strong className="text-strong">{start + 1}. {startStep.name}</strong>
          {start === state.level ? ', c’est ton étape actuelle.' : `, tu es aujourd’hui à l’étape ${state.level + 1}.`}
        </p>
        <ol className="prio">
          {order.map((lock, i) => (
            <li key={lock.id}>
              <span className="prio-n muted">Priorité {i + 1}</span>
              <span>
                <LockChip skill={skill} lockId={lock.id} /> {skill.advice[lock.id][answers[lock.id] ?? 1]}
              </span>
            </li>
          ))}
        </ol>
        {saved ? (
          <p className="saved-line">Diagnostic enregistré. Tes prochaines séances en tiennent compte.</p>
        ) : start !== state.level ? (
          <>
            <button type="button" className="button primary" onClick={() => save(true)}>
              Commencer à l’étape {start + 1} : {startStep.name}
            </button>
            <button type="button" className="button ghost" onClick={() => save(false)}>
              Enregistrer sans changer d’étape
            </button>
          </>
        ) : (
          <button type="button" className="button primary" onClick={() => save(true)}>
            Enregistrer le diagnostic
          </button>
        )}
      </section>
    </>
  );
}

function LearnTab({ skill }: { skill: Skill }) {
  const withLoad = skill.steps.filter((s) => s.load !== undefined);
  return (
    <>
      <div className="prose">
        {skill.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <h2 className="section-title">Les trois verrous</h2>
      <div className="lock-cards">
        {skill.locks.map((lock) => (
          <section key={lock.id} className="lock-card" style={lockStyle(skill, lock.id)}>
            <p className="lock-name">{lock.name}</p>
            <p className="muted small">{lock.text}</p>
          </section>
        ))}
      </div>

      {withLoad.length > 0 && (
        <>
          <h2 className="section-title">La charge, étape par étape</h2>
          <section className="panel">
            <ul className="load-bars">
              {skill.steps.map((s, i) =>
                s.load === undefined || skill.steps.slice(0, i).some((p) => p.name === s.name || (p.ex === s.ex && p.load === s.load)) ? null : (
                  <li key={i}>
                    <span className="kind-name">{s.name}</span>
                    <span className="kind-pct num">{s.load} %</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ width: `${Math.max(s.load, 1)}%` }} />
                    </span>
                  </li>
                ),
              )}
            </ul>
            <p className="panel-foot">Effort des hanches pour porter les jambes, comparé au L-sit complet. Le tuck avancé et le L-sit une jambe sont proches en charge, mais le second demande de la souplesse et un genou verrouillé.</p>
          </section>
        </>
      )}

      <section className="callout">
        <p className="callout-title">{skill.keyPoint.title}</p>
        {skill.keyPoint.text.map((p) => (
          <p key={p} className="callout-p">
            {p}
          </p>
        ))}
      </section>

      <h2 className="section-title">Les muscles</h2>
      <div className="stack">
        {skill.locks.map((lock) => (
          <section key={lock.id} className="panel muscle-group" style={lockStyle(skill, lock.id)}>
            <LockChip skill={skill} lockId={lock.id} />
            <ul className="muscles">
              {skill.muscles[lock.id].map((m) => (
                <li key={m.name}>
                  <strong className="text-strong">{m.name}</strong> <span className="muted">{m.role}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="section-title">Les erreurs qui bloquent</h2>
      <div className="errors">
        {skill.errors.map((e) => (
          <div key={e.title} className="error-card">
            <p className="error-title">{e.title}</p>
            <p className="muted small">{e.text}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Combien de temps ça prend</h2>
      <section className="panel">
        <p className="muted">{skill.timeline}</p>
      </section>
      <p className="hint">Une douleur vive aux poignets, aux coudes, aux épaules, aux genoux ou dans le bas du dos est un signal d’arrêt : allège, ou fais vérifier si elle persiste.</p>
    </>
  );
}

function ExercisesTab({ skill, state }: { skill: Skill; state: SkillState }) {
  const order = priorities(skill, state.answers);
  return (
    <>
      <p className="lead">
        Chaque exercice reproduit une partie de la figure en enlevant de la difficulté ailleurs. {state.diagnosed ? 'Ils sont classés selon ton diagnostic.' : 'Fais le diagnostic pour les classer selon tes points faibles.'}
      </p>
      {order.map((lock, i) => (
        <section key={lock.id}>
          <div className="section-head lock-head">
            <h2 className="section-title">
              <LockChip skill={skill} lockId={lock.id} />
            </h2>
            <span className="muted small">Priorité {i + 1}</span>
          </div>
          <p className="muted small">{lock.text}</p>
          <p className="advice">{skill.advice[lock.id][state.answers[lock.id] ?? 1]}</p>
          <div className="stack tight">
            {skill.exercises[lock.id].map((item) => {
              const exercise = EXERCISES[item.ex];
              return (
                <a key={item.ex} className="exercise-row assist-row" href={href('exercice', item.ex)}>
                  <div className="exercise-thumb">
                    <Figure anim={exercise.anim} label="" />
                  </div>
                  <div className="exercise-text">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-dose-inline num">{item.dose}</span>
                    <span className="exercise-note">{item.why}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
