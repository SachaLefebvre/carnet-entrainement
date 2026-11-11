// Planche de contrôle : toutes les poses de toutes les animations, pour les vérifier d'un coup d'œil.
import { createRoot } from 'react-dom/client';
import { Figure } from './components/Figure';
import { ANIMS } from './data/poses';
import './figure.css';

const only = new URLSearchParams(location.search).get('only')?.split(',');
const live = new URLSearchParams(location.search).has('live');

createRoot(document.getElementById('root')!).render(
  <div className="sheet">
    {Object.entries(ANIMS)
      .filter(([id]) => !only || only.includes(id))
      .flatMap(([id, anim]) =>
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
