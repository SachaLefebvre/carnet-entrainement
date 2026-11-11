import { useState } from 'react';
import { Figure } from '../components/Figure';
import { CATEGORIES, CATEGORY_LABEL, EXERCISE_LIST, EXERCISES, type Category } from '../data/exercises';
import { capitalize, dayAndMonth, weekdayName } from '../lib/dates';
import { href } from '../lib/router';
import { exerciseHistory } from '../lib/stats';
import { useStore } from '../lib/store';
import { TopBar } from '../ui';

type Filter = Category | 'tout';

export function Library() {
  const [filter, setFilter] = useState<Filter>('tout');
  const [query, setQuery] = useState('');
  const text = query.trim().toLowerCase();
  const shown = EXERCISE_LIST.filter((e) => (filter === 'tout' || e.cat === filter) && (!text || e.name.toLowerCase().includes(text)));

  return (
    <main className="screen">
      <header className="page-head">
        <div>
          <p className="overline">{EXERCISE_LIST.length} mouvements illustrés</p>
          <h1>Exercices</h1>
        </div>
      </header>

      <label className="search">
        <span className="sr-only">Chercher un exercice</span>
        <input type="search" placeholder="Chercher un exercice" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      <div className="filters" role="group" aria-label="Catégorie">
        <button type="button" aria-pressed={filter === 'tout'} onClick={() => setFilter('tout')}>
          Tout
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} type="button" aria-pressed={filter === cat} onClick={() => setFilter(cat)}>
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="muted">Aucun exercice ne correspond. Essaie un autre mot ou une autre catégorie.</p>
      ) : (
        <div className="grid">
          {shown.map((exercise) => (
            <a key={exercise.id} className="tile" href={href('exercice', exercise.id)}>
              <div className="tile-figure">
                <Figure anim={exercise.anim} label="" />
              </div>
              <span className="tile-name">{exercise.name}</span>
              <span className="tile-cat">{CATEGORY_LABEL[exercise.cat]}</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

export function ExercisePage({ id }: { id: string }) {
  const { entries } = useStore();
  const exercise = EXERCISES[id];
  if (!exercise) {
    return (
      <main className="screen">
        <TopBar title="Exercice" fallback={['exercices']} />
        <p className="muted">Cet exercice n’existe pas.</p>
      </main>
    );
  }
  const history = exerciseHistory(entries, id);
  const best = history.reduce((max, log) => Math.max(max, ...log.sets), 0);

  return (
    <main className="screen">
      <TopBar title={CATEGORY_LABEL[exercise.cat]} fallback={['exercices']} />
      <div className="stage is-large">
        <Figure anim={exercise.anim} playing label={`Démonstration : ${exercise.name}`} />
      </div>
      <h1>{exercise.name}</h1>
      <p className="muted">{exercise.muscles}</p>

      <h2 className="section-title">Comment faire</h2>
      <ol className="steps">
        {exercise.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <section className="callout">
        <p className="callout-title">À éviter</p>
        <p>{exercise.avoid}</p>
      </section>

      {(exercise.easier || exercise.harder) && (
        <dl className="variants">
          {exercise.easier && (
            <div>
              <dt>Plus facile</dt>
              <dd>{exercise.easier}</dd>
            </div>
          )}
          {exercise.harder && (
            <div>
              <dt>Plus dur</dt>
              <dd>{exercise.harder}</dd>
            </div>
          )}
        </dl>
      )}

      <h2 className="section-title">Ton historique</h2>
      {history.length === 0 ? (
        <p className="muted">Rien pour l’instant. Tes séries apparaîtront ici après une séance en mode guidé.</p>
      ) : (
        <section className="panel">
          <p className="panel-head">
            Meilleure série
            <span className="num">{best}</span>
          </p>
          <ul className="recorded">
            {history.slice(0, 8).map((log) => (
              <li key={log.day}>
                <span>
                  {capitalize(weekdayName(log.day))} {dayAndMonth(log.day)}
                </span>
                <span className="num">{log.sets.join(' / ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
