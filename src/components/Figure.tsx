import { useEffect, useMemo, useState } from 'react';
import { ANIMS, type Anchor, type Anim, type Pose, type Pt } from '../data/poses';

// Le personnage : un squelette 2D dont les membres ont une longueur fixe.
// Une pose ne donne que les points d'appui (bassin, épaules, mains, pieds) ;
// les coudes et les genoux sont calculés, ce qui garde des proportions justes
// et des appuis immobiles pendant l'animation.

const TORSO = 40;
const UPPER_ARM = 21;
const FOREARM = 20;
const THIGH = 31;
const SHIN = 31;
const FOOT = 11;
const HEAD = 9.5;
const GROUND = 175;

const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const unit = (a: Pt): Pt => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPt = (a: Pt, b: Pt, t: number): Pt => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const polar = (deg: number, r: number): Pt => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r];

/** Articulation intermédiaire d'un membre à deux segments, du côté indiqué par `hint`. */
function bend(root: Pt, target: Pt, l1: number, l2: number, hint: Pt): { joint: Pt; end: Pt } {
  const delta = sub(target, root);
  const u = unit(delta);
  const d = Math.min(Math.max(len(delta), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const mid = add(root, mul(u, a));
  const perp: Pt = [-u[1], u[0]];
  const side = perp[0] * hint[0] + perp[1] * hint[1] >= 0 ? 1 : -1;
  return { joint: add(mid, mul(perp, h * side)), end: add(root, mul(u, d)) };
}

interface FullPose {
  hip: Pt;
  sh: Pt;
  hA: Pt;
  hB: Pt;
  fA: Pt;
  fB: Pt;
  eA?: Pt;
  eB?: Pt;
  kA?: Pt;
  kB?: Pt;
  toeA: number;
  toeB: number;
  head?: Pt;
  curve: number;
  club?: number;
}

const complete = (p: Pose): FullPose => ({
  ...p,
  hB: p.hB ?? p.hA,
  fB: p.fB ?? p.fA,
  toeA: p.toeA ?? 0,
  toeB: p.toeB ?? p.toeA ?? 0,
  curve: p.curve ?? 0,
});

const optPt = (a: Pt | undefined, b: Pt | undefined, t: number) => (a && b ? mixPt(a, b, t) : undefined);

function blend(a: FullPose, b: FullPose, t: number): FullPose {
  return {
    hip: mixPt(a.hip, b.hip, t),
    sh: mixPt(a.sh, b.sh, t),
    hA: mixPt(a.hA, b.hA, t),
    hB: mixPt(a.hB, b.hB, t),
    fA: mixPt(a.fA, b.fA, t),
    fB: mixPt(a.fB, b.fB, t),
    eA: optPt(a.eA, b.eA, t),
    eB: optPt(a.eB, b.eB, t),
    kA: optPt(a.kA, b.kA, t),
    kB: optPt(a.kB, b.kB, t),
    toeA: mix(a.toeA, b.toeA, t),
    toeB: mix(a.toeB, b.toeB, t),
    head: optPt(a.head ?? unit(sub(a.sh, a.hip)), b.head ?? unit(sub(b.sh, b.hip)), t),
    curve: mix(a.curve, b.curve, t),
    club: a.club !== undefined && b.club !== undefined ? mix(a.club, b.club, t) : undefined,
  };
}

const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/** Pose à l'instant `time` (ms), selon le mode de boucle de l'animation. */
function poseAt(anim: Anim, time: number): FullPose {
  const frames = anim.frames.map(complete);
  if (frames.length === 1) {
    // Position tenue : une légère respiration suffit.
    const lift = Math.sin(time / 520) * 1.1;
    const f = frames[0];
    return { ...f, hip: [f.hip[0], f.hip[1] + lift], sh: [f.sh[0], f.sh[1] + lift] };
  }
  const step = anim.ms ?? 1000;
  const pause = anim.pause ?? 260;
  const slot = step + pause;
  const n = frames.length;
  const loop = anim.loop ?? 'pingpong';
  const segments = loop === 'pingpong' ? 2 * (n - 1) : loop === 'cycle' ? n : n - 1;
  const total = segments * slot + (loop === 'restart' ? 700 : 0);
  const local = Math.max(0, time) % total;
  const index = Math.max(0, Math.min(Math.floor(local / slot), segments - 1));
  const t = ease(Math.min((local - index * slot) / step, 1));
  let from = index;
  let to = index + 1;
  if (loop === 'pingpong' && index >= n - 1) {
    from = 2 * (n - 1) - index;
    to = from - 1;
  }
  if (loop === 'cycle') to = (index + 1) % n;
  if (loop === 'restart' && local >= segments * slot) return frames[n - 1];
  return blend(frames[from], frames[to], t);
}

interface Skeleton {
  hip: Pt;
  neck: Pt;
  headAt: Pt;
  shA: Pt;
  shB: Pt;
  hipA: Pt;
  hipB: Pt;
  eA: Pt;
  eB: Pt;
  hA: Pt;
  hB: Pt;
  kA: Pt;
  kB: Pt;
  fA: Pt;
  fB: Pt;
  tA: Pt;
  tB: Pt;
  spine: Pt;
  club?: Pt;
}

function solve(anim: Anim, p: FullPose): Skeleton {
  const axis = unit(sub(p.sh, p.hip));
  const neck = add(p.hip, mul(axis, TORSO));
  // Perpendiculaire au buste, orientée vers la gauche de l'image quand le personnage est debout.
  const across: Pt = [axis[1], -axis[0]];
  // De face, les épaules et les hanches ont une largeur ; de profil, elles se superposent.
  const shoulderHalf = anim.front ? 11 : 0;
  const hipHalf = anim.front ? 7 : 0;
  const shA = add(neck, mul(across, shoulderHalf));
  const shB = add(neck, mul(across, -shoulderHalf));
  const hipA = add(p.hip, mul(across, hipHalf));
  const hipB = add(p.hip, mul(across, -hipHalf));
  const elbowHint: Pt = anim.elbow ?? (anim.front ? [-1, 0.3] : [-1, 0.4]);
  const elbowHintB: Pt = anim.elbowB ?? (anim.front ? [1, 0.3] : elbowHint);
  const kneeHint: Pt = anim.knee ?? (anim.front ? [-1, 0] : [1, -0.2]);
  const kneeHintB: Pt = anim.kneeB ?? (anim.front ? [1, 0] : kneeHint);
  const armA = bend(shA, p.hA, UPPER_ARM, FOREARM, elbowHint);
  const armB = bend(shB, p.hB, UPPER_ARM, FOREARM, elbowHintB);
  const legA = bend(hipA, p.fA, THIGH, SHIN, kneeHint);
  const legB = bend(hipB, p.fB, THIGH, SHIN, kneeHintB);
  const fA = p.kA ? p.fA : legA.end;
  const fB = p.kB ? p.fB : legB.end;
  const hA = p.eA ? p.hA : armA.end;
  const headDir = unit(p.head ?? axis);
  const mid = mixPt(p.hip, neck, 0.5);
  return {
    hip: p.hip,
    neck,
    headAt: add(neck, mul(headDir, HEAD + 6)),
    shA,
    shB,
    hipA,
    hipB,
    eA: p.eA ?? armA.joint,
    eB: p.eB ?? armB.joint,
    hA,
    hB: p.eB ? p.hB : armB.end,
    kA: p.kA ?? legA.joint,
    kB: p.kB ?? legB.joint,
    fA,
    fB,
    tA: add(fA, polar(p.toeA, FOOT)),
    tB: add(fB, polar(p.toeB, FOOT)),
    spine: add(mid, mul(across, -p.curve)),
    club: p.club === undefined ? undefined : add(hA, polar(p.club, 46)),
  };
}

const d = (...points: Pt[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

function anchor(s: Skeleton, a: Anchor): Pt {
  if (typeof a !== 'string') return a;
  if (a === 'sh') return s.neck;
  return s[a];
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Cadre qui contient le personnage et ses accessoires sur toutes les poses de l'animation.
 * Le dessin remplit ainsi sa vignette, quelle que soit la posture (debout, allongé, suspendu).
 */
function frameOf(anim: Anim): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const grow = (pt: Pt, r = 6) => {
    minX = Math.min(minX, pt[0] - r);
    maxX = Math.max(maxX, pt[0] + r);
    minY = Math.min(minY, pt[1] - r);
    maxY = Math.max(maxY, pt[1] + r);
  };
  for (const frame of anim.frames) {
    const k = solve(anim, complete(frame));
    for (const pt of [k.hip, k.neck, k.eA, k.eB, k.hA, k.hB, k.kA, k.kB, k.fA, k.fB, k.tA, k.tB]) grow(pt);
    grow(k.headAt, HEAD + 1);
    if (k.club) grow(k.club, 3);
  }
  for (const prop of anim.props ?? []) {
    if (prop.t === 'bar') grow([prop.at[0], prop.at[1] - 8], 8);
    if (prop.t === 'box') {
      grow([prop.x, prop.y], 2);
      grow([prop.x + prop.w, prop.y + prop.h], 2);
    }
    if (prop.t === 'wall') grow([prop.x, maxY], 5);
    if (prop.t === 'band') for (const end of [prop.from, prop.to]) if (typeof end !== 'string') grow(end, 2);
  }
  if (anim.ground ?? true) maxY = Math.max(maxY, GROUND + 7);
  const pad = 9;
  let w = maxX - minX + 2 * pad;
  let h = maxY - minY + 2 * pad;
  let x = minX - pad;
  let y = minY - pad;
  // Un cadre minimal évite qu'une pose compacte paraisse énorme à côté des autres.
  const MIN = 104;
  if (w < MIN) {
    x -= (MIN - w) / 2;
    w = MIN;
  }
  if (h < MIN) {
    y -= MIN - h;
    h = MIN;
  }
  return { x, y, w, h };
}

function usePlayhead(playing: boolean) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // L'horodatage de la première image peut précéder `start` : jamais de temps négatif.
      setTime(Math.max(0, now - start));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  return time;
}

interface Props {
  anim: string;
  /** Animé ou figé sur la pose la plus parlante. */
  playing?: boolean;
  className?: string;
  label?: string;
  /** Force une pose précise (planche de contrôle). */
  frame?: number;
}

export function Figure({ anim: animId, playing = false, className, label, frame }: Props) {
  const anim = ANIMS[animId] ?? ANIMS.stand;
  const time = usePlayhead(playing);
  const still = complete(anim.frames[Math.min(frame ?? anim.still ?? anim.frames.length - 1, anim.frames.length - 1)]);
  const s = solve(anim, playing ? poseAt(anim, time) : still);
  const ground = anim.ground ?? true;
  const box = useMemo(() => frameOf(anim), [anim]);
  const bottom = ground ? GROUND + 4.5 : box.y + box.h - 3;

  return (
    <svg viewBox={`${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)}`} className={`figure${className ? ` ${className}` : ''}`} role="img" aria-label={label ?? 'Illustration de l’exercice'}>
      {ground && <path className="fig-ground" d={`M${box.x + 3} ${GROUND + 4.5} H${box.x + box.w - 3}`} />}
      {anim.props?.map((prop, i) => {
        if (prop.t === 'wall') return <path key={i} className="fig-prop" d={`M${prop.x} ${box.y + 4} V${bottom}`} />;
        if (prop.t === 'box') return <rect key={i} className="fig-box" x={prop.x} y={prop.y} width={prop.w} height={prop.h} rx="3" />;
        if (prop.t === 'bar')
          return (
            <g key={i}>
              <path className="fig-prop thin" d={`M${prop.at[0]} ${box.y + 2} V${prop.at[1]}`} />
              <circle className="fig-bar" cx={prop.at[0]} cy={prop.at[1]} r="4" />
            </g>
          );
        return null;
      })}

      {/* Membres du second plan */}
      <g className={anim.front ? 'fig-far is-front' : 'fig-far'}>
        <path d={d(s.shB, s.eB, s.hB)} />
        <path d={d(s.hipB, s.kB, s.fB)} />
        <path className="fig-foot" d={d(s.fB, s.tB)} />
      </g>

      <g className="fig-body">
        <path className="fig-torso" d={`M${s.hip[0].toFixed(1)} ${s.hip[1].toFixed(1)} Q${s.spine[0].toFixed(1)} ${s.spine[1].toFixed(1)} ${s.neck[0].toFixed(1)} ${s.neck[1].toFixed(1)}`} />
        {anim.front && <path className="fig-torso" d={d(s.shA, s.shB)} />}
        <circle cx={s.headAt[0]} cy={s.headAt[1]} r={HEAD} />
      </g>

      {/* Membres du premier plan, détourés pour se détacher du buste */}
      <g className="fig-cut">
        <path d={d(s.hipA, s.kA, s.fA)} />
        <path d={d(s.shA, s.eA, s.hA)} />
      </g>
      <g className="fig-near">
        <path d={d(s.hipA, s.kA, s.fA)} />
        <path className="fig-foot" d={d(s.fA, s.tA)} />
        <path d={d(s.shA, s.eA, s.hA)} />
      </g>

      {s.club && <path className="fig-club" d={d(s.hA, s.club)} />}
      {anim.props?.map((prop, i) =>
        prop.t === 'band' ? <path key={i} className="fig-band" d={d(anchor(s, prop.from), anchor(s, prop.to))} /> : null,
      )}
    </svg>
  );
}
