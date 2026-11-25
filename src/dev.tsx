// Planche de contrôle : toutes les poses de toutes les animations, pour les vérifier d'un coup d'œil.
import { createRoot } from 'react-dom/client';
import { Figure } from './components/Figure';
import { ANIMS } from './data/poses';
import { EXERCISES } from './data/exercises';
import './figure.css';

const only = new URLSearchParams(location.search).get('only')?.split(',');
const live = new URLSearchParams(location.search).has('live');
const stills = new URLSearchParams(location.search).has('stills');
const used: Record<string, string[]> = {};
for (const e of Object.values(EXERCISES)) (used[e.anim] ??= []).push(e.name);

createRoot(document.getElementById('root')!).render(
  <div className="sheet">
    {Object.entries(ANIMS)
      .filter(([id]) => (!only || only.includes(id)) && (!stills || used[id]))
      .flatMap(([id, anim]) =>
        stills ? (
          <div className="cell" key={id}>
            <p>{id}</p>
            <Figure anim={id} />
            <p style={{ fontSize: 10, opacity: 0.7 }}>{used[id].join(', ')}</p>
          </div>
        ) :
        (live ? [0] : anim.frames.map((_, i) => i)).map((i) => (
          <div className="cell" key={`${id}-${i}`}>
            <p>
              {id} {live ? '' : i}
            </p>
            <Figure anim={id} frame={i} playing={live} />
          </div>
        )),
      )}
  </div>,
);
