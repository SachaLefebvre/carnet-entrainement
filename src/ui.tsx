// Éléments d'interface partagés entre les écrans.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Figure } from './components/Figure';
import { exerciseCount, KIND_LABEL, type Kind, type Session } from './data/programme';
import { back, href } from './lib/router';
import type { Entry } from './lib/store';

/** Couleur de la discipline, exposée aux styles par la variable --k. */
export const kindStyle = (kind: Kind) => ({ '--k': `var(--${kind})` }) as CSSProperties;

const ICONS = {
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  calendar: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4',
  library: 'M4 9v6M7 6v12M17 6v12M20 9v6M7 12h10',
  figure: 'M12 3.5a1.75 1.75 0 1 0 0 .01M12 7v6M6 8.5l6 2 6-2M12 13l-4 7M12 13l4 7',
  stats: 'M5 20v-6M12 20V5M19 20v-10',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5v14l11-7z',
  pause: 'M8 5v14M16 5v14',
  flame: 'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  skip: 'M6 5l9 7-9 7zM18 5v14',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  scale: 'M5 4h14l1 16H4zM9 9a3 3 0 0 1 6 0M12 9l1.5-2',
  golf: 'M7 21h10M12 21V4l7 3.5L12 11',
  move: 'M7 7h13M17 4l3 3-3 3M17 17H4M7 14l-3 3 3 3',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
};

export function Icon({ name, size = 22 }: { name: keyof typeof ICONS; size?: number }) {
  const filled = name === 'play';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d={ICONS[name]}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 1.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface RingProps {
  /** Entre 0 et 1. */
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  label: string;
}

/** Anneau de progression. Le texte associé porte toujours la valeur : l'anneau n'est jamais seul. */
export function Ring({ value, size = 120, stroke = 10, children, label }: RingProps) {
  const r = (size - stroke) / 2;
  const length = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        {clamped > 0 && (
          <circle
            className="ring-value"
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeDasharray={`${length * clamped} ${length}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      {children && <div className="ring-center">{children}</div>}
    </div>
  );
}

/** Barre de titre des écrans secondaires, avec retour. */
export function TopBar({ title, fallback = [], action }: { title: string; fallback?: string[]; action?: ReactNode }) {
  return (
    <div className="topbar">
      <button type="button" className="icon-button" onClick={() => back(fallback)} aria-label="Retour">
        <Icon name="back" />
      </button>
      <p className="topbar-title">{title}</p>
      <div className="topbar-action">{action}</div>
    </div>
  );
}

/** Carte d'une séance : vignette animée, titre, durée, état. */
export function SessionCard({ day, session, entry, resume }: { day: string; session: Session; entry: Entry; resume?: boolean }) {
  const count = exerciseCount(session);
  return (
    <a className={`session-card${entry.done ? ' is-done' : ''}`} href={href('seance', day, session.id)} style={kindStyle(session.kind)}>
      <div className="session-thumb">
        <Figure anim={session.anim} label="" />
      </div>
      <div className="session-text">
        <span className="session-kind">
          {KIND_LABEL[session.kind]}
        </span>
        <span className="session-title">{session.title}</span>
        <span className="session-meta">
          {session.minutes} min{count > 0 ? `, ${count} exercice${count > 1 ? 's' : ''}` : ''}
        </span>
      </div>
      <div className="session-state">
        {entry.done ? (
          <span className="done-badge">
            <Icon name="check" size={18} />
            <span className="sr-only">Séance faite</span>
          </span>
        ) : resume ? (
          <span className="resume-tag">Reprendre</span>
        ) : (
          <Icon name="next" size={20} />
        )}
      </div>
    </a>
  );
}

export interface ChartPoint {
  day: string;
  value: number;
}

/**
 * Courbe d'évolution : une ou deux séries, et une ligne d'objectif facultative.
 * La valeur du point choisi est toujours écrite sous le graphique.
 */
export function Chart({
  series,
  goal,
  format,
  label,
  dates,
}: {
  series: { name: string; points: ChartPoint[]; muted?: boolean }[];
  goal?: ChartPoint[];
  format: (v: number) => string;
  label: string;
  dates: (day: string) => string;
}) {
  const main = series[0].points;
  const [index, setIndex] = useState(main.length - 1);
  const all = [...series.flatMap((s) => s.points), ...(goal ?? [])];
  if (main.length === 0) return null;
  const days = [...new Set(all.map((p) => p.day))].sort();
  const first = days[0];
  const last = days[days.length - 1];
  const span = Math.max(1, (Date.parse(last) - Date.parse(first)) / 86_400_000);
  const values = all.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.12 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const W = 320;
  const H = 120;
  const x = (day: string) => 14 + ((Date.parse(day) - Date.parse(first)) / 86_400_000 / span) * (W - 28);
  const y = (v: number) => H - 14 - ((v - lo) / (hi - lo)) * (H - 28);
  const active = Math.min(index, main.length - 1);
  const line = (points: ChartPoint[]) => points.map((p) => `${x(p.day).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <text className="chart-tick" x={4} y={12}>
          {format(max)}
        </text>
        <text className="chart-tick" x={4} y={H - 2}>
          {format(min)}
        </text>
        {goal && goal.length > 1 && <polyline className="chart-goal" points={line(goal)} />}
        {series
          .slice()
          .reverse()
          .map((s) => (
            <polyline key={s.name} className={`spark-line${s.muted ? ' is-muted' : ''}`} points={line(s.points)} />
          ))}
        {main.map((p, i) => (
          <g key={p.day}>
            <circle className={`spark-dot${i === active ? ' is-active' : ''}`} cx={x(p.day)} cy={y(p.value)} r={i === active ? 5.5 : 3.5} />
            <rect className="spark-hit" x={x(p.day) - 12} y={0} width={24} height={H} onMouseEnter={() => setIndex(i)} onClick={() => setIndex(i)} aria-label={`${dates(p.day)} : ${format(p.value)}`} />
          </g>
        ))}
      </svg>
      <p className="readout" aria-live="polite">
        {dates(main[active].day)} : <strong className="num">{format(main[active].value)}</strong>
        {series.slice(1).map((s) => {
          const match = s.points.find((p) => p.day === main[active].day);
          return match ? (
            <span key={s.name}>
              , {s.name} <span className="num">{format(match.value)}</span>
            </span>
          ) : null;
        })}
      </p>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((option) => (
        <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
