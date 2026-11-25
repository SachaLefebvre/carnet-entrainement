import { addDays, diffDays, mondayOf, weekday } from '../lib/dates';
import { getEntries, getEntry } from '../lib/store';
import { adjusted } from '../lib/adjust';

// Le programme v3 : priorité à la performance golf.
// Quatre blocs jusqu'à la saison, puis un cycle d'entretien. La dernière semaine de chaque bloc
// est allégée et sert aux tests. Le calendrier de la semaine est fixe, le contenu évolue.

export const PROGRAM_START = '2026-11-30';
export const SEASON_START = '2027-03-08';
export const ATHLETE = 'Sacha';

export type Kind = 'mobilite' | 'muscu' | 'course' | 'vitesse';

// Ordre fixe : il détermine aussi l'attribution des couleurs dans les graphiques.
export const KINDS: Kind[] = ['muscu', 'course', 'mobilite', 'vitesse'];

export const KIND_LABEL: Record<Kind, string> = {
  muscu: 'Musculation',
  course: 'Course',
  mobilite: 'Mobilité',
  vitesse: 'Vitesse de swing',
};

export type Equip = 'elastique' | 'kettlebell' | 'medecine-ball';

export interface Item {
  /** Identifiant de l'exercice dans exercises.ts. */
  ex: string;
  sets: number;
  reps?: number;
  /** Tenue en secondes. */
  hold?: number;
  minutes?: number;
  perSide?: boolean;
  /** Repos après chaque série, en secondes. */
  rest: number;
  /** Texte libre quand la dose ne se résume pas à séries x répétitions. */
  label?: string;
  note?: string;
  /** Tenue au maximum : le chrono continue après l'objectif et note le temps réel. */
  max?: boolean;
  /** Matériel dont on note la charge. */
  equip?: Equip;
  /** Contacts au sol par répétition (pliométrie). */
  contacts?: number;
  /** Test dont le résultat est saisi à la fin de l'exercice. */
  test?: string;
  /** Clé d'ajustement (programme prévu puis ajusté selon les résultats). */
  adjustKey?: string;
}

export interface Block {
  title: string;
  items: Item[];
  /** Bloc affiché seulement (déroulé d'une course), sans étape dans le mode guidé. */
  display?: boolean;
}

/** Une phase chronométrée d'une séance de course. */
export interface Phase {
  label: string;
  seconds: number;
  fast?: boolean;
}

export interface Session {
  id: string;
  kind: Kind;
  title: string;
  /** Durée estimée, en minutes. */
  minutes: number;
  intro: string;
  blocks: Block[];
  phases?: Phase[];
  /** Animation de couverture. */
  anim: string;
  /** Séance qui sollicite fortement les jambes : deux d'affilée sont signalées. */
  legs?: boolean;
  /** Course : saisie de la distance et du temps. */
  run?: boolean;
  /** Test rempli à partir du temps de course saisi. */
  runTest?: string;
}

// ---------------------------------------------------------------------------
// Périodisation

export interface Bloc {
  id: string;
  name: string;
  weeks: number;
  focus: string;
  /** Index de la semaine allégée dans le bloc. */
  light: number;
}

export const BLOCS: Bloc[] = [
  { id: 'fondations', name: 'Fondations', weeks: 4, light: 3, focus: 'Force de base, stabilité, protection du dos, technique des sauts et de la vitesse.' },
  { id: 'force', name: 'Force', weeks: 4, light: 3, focus: 'Plus de charge et de volume, unilatéral, la puissance de rotation monte.' },
  { id: 'puissance', name: 'Puissance', weeks: 4, light: 3, focus: 'Moins de volume, plus d’explosivité : contraste, sauts en contrebas, overspeed.' },
  { id: 'pre-saison', name: 'Pré-saison', weeks: 2, light: 1, focus: 'On garde la vitesse, on allège le reste pour arriver frais en mars.' },
  { id: 'saison', name: 'Saison', weeks: 4, light: 3, focus: 'Entretien : moins de volume, l’intensité reste.' },
];

export interface WeekInfo {
  /** Semaine du programme, à partir de 0. Négative avant le départ. */
  index: number;
  bloc: Bloc;
  /** 0 = fondations ... 4 = saison. */
  b: number;
  /** Semaine dans le bloc, à partir de 0 (le cycle de saison reboucle). */
  w: number;
  light: boolean;
  started: boolean;
}

export function weekInfo(day: string): WeekInfo {
  const index = Math.floor(diffDays(PROGRAM_START, mondayOf(day)) / 7);
  let rest = Math.max(0, index);
  for (let b = 0; b < BLOCS.length - 1; b += 1) {
    if (rest < BLOCS[b].weeks) return { index, bloc: BLOCS[b], b, w: rest, light: rest === BLOCS[b].light, started: index >= 0 };
    rest -= BLOCS[b].weeks;
  }
  const saison = BLOCS[BLOCS.length - 1];
  const w = rest % saison.weeks;
  return { index, bloc: saison, b: BLOCS.length - 1, w, light: w === saison.light, started: index >= 0 };
}

/** Premier lundi de chaque bloc (le cycle de saison n'est compté qu'une fois). */
export function blocStarts(): { bloc: Bloc; monday: string }[] {
  let monday = PROGRAM_START;
  return BLOCS.map((bloc) => {
    const start = { bloc, monday };
    monday = addDays(monday, bloc.weeks * 7);
    return start;
  });
}

/** Valeur selon la semaine du bloc : [s1, s2, s3, allégée]. Les blocs plus courts prennent les premières. */
function wk<T>(info: WeekInfo, values: T[]): T {
  if (info.light) return values[values.length - 1];
  return values[Math.min(info.w, values.length - 2)];
}

/** Valeur selon le bloc : [fondations, force, puissance, pré-saison, saison]. */
function bl<T>(info: WeekInfo, values: T[]): T {
  return values[Math.min(info.b, values.length - 1)];
}

// ---------------------------------------------------------------------------
// Utilitaires de construction

export function dose(item: Item): string {
  if (item.label) return item.label;
  const side = item.perSide ? ' par côté' : '';
  if (item.minutes) return `${item.minutes} min`;
  if (item.hold) return `${item.sets > 1 ? `${item.sets} x ` : ''}${item.hold >= 60 && item.hold % 60 === 0 ? `${item.hold / 60} min` : `${item.hold} s`}${item.max ? ' ou plus' : ''}${side}`;
  return `${item.sets > 1 ? `${item.sets} x ` : ''}${item.reps}${item.sets > 1 ? '' : ' répétitions'}${side}`;
}

const one = (ex: string, reps: number, perSide = false, extra: Partial<Item> = {}): Item => ({ ex, sets: 1, reps, perSide, rest: 0, ...extra });
const hold = (ex: string, seconds: number, perSide = false, extra: Partial<Item> = {}): Item => ({ ex, sets: 1, hold: seconds, perSide, rest: 0, ...extra });

/** Volume réduit en semaine allégée : une série de moins, jamais moins de deux. */
function lighten(info: WeekInfo, sets: number) {
  return info.light ? Math.max(Math.min(sets, 2), sets - 1) : sets;
}

/** Durée estimée d'une séance, arrondie à 5 minutes. */
function estimateMinutes(blocks: Block[]): number {
  let seconds = 0;
  for (const item of blocks.filter((b) => !b.display).flatMap((b) => b.items)) {
    const sides = item.perSide ? 2 : 1;
    if (item.minutes) {
      seconds += item.minutes * 60;
      continue;
    }
    const work = item.hold ? item.hold * sides : (item.reps ?? 6) * (item.contacts ? 1.2 : 3.5) * sides;
    seconds += 25 + item.sets * work + Math.max(0, item.sets - 1) * item.rest;
  }
  return Math.max(10, Math.round(seconds / 300) * 5);
}

/** Un même exercice n'apparaît qu'une fois par séance (sauf les tests, qui peuvent se répéter). */
function dedupe(blocks: Block[]): Block[] {
  const seen = new Set<string>();
  return blocks
    .map((block) => ({ ...block, items: block.items.filter((item) => (item.test || item.label ? true : seen.has(item.ex) ? false : (seen.add(item.ex), true))) }))
    .filter((block) => block.items.length > 0);
}

/** Les exercices de force reçoivent leur ajustement validé (répétitions en plus ou en moins). */
function withAdjust(info: WeekInfo, sessionId: string, blocks: Block[]): Block[] {
  return blocks.map((block) => ({
    ...block,
    items: block.items.map((item) => {
      if (!item.equip && !item.adjustKey) return item;
      if (item.reps === undefined || item.contacts) return item;
      const key = `${info.bloc.id}:${sessionId}:${item.ex}`;
      const adj = adjusted(getEntries(), key);
      const reps = adj?.reps ? Math.max(1, item.reps + adj.reps) : item.reps;
      return { ...item, reps, adjustKey: key };
    }),
  }));
}

/** Nombre total de contacts au sol d'une séance (pliométrie). */
export function contactCount(session: Session): number {
  return session.blocks
    .filter((b) => !b.display)
    .flatMap((b) => b.items)
    .reduce((n, i) => n + (i.contacts ? i.sets * (i.reps ?? 0) * i.contacts * (i.perSide ? 2 : 1) : 0), 0);
}

export const exerciseCount = (session: Session) => session.blocks.filter((b) => !b.display).reduce((n, block) => n + block.items.length, 0);

// ---------------------------------------------------------------------------
// Mobilité du matin : la même chaque jour, 15 minutes.

const mobilite: Session = {
  id: 'mobilite',
  kind: 'mobilite',
  title: 'Mobilité du matin',
  minutes: 15,
  anim: 'wgs',
  intro: 'Au réveil, sans matériel et sans forcer : des chevilles aux épaules, puis debout en posture de golf. Le but est la liberté de mouvement du swing, pas l’étirement fort.',
  blocks: [
    { title: 'Chevilles et poignets', items: [one('genou-au-mur', 10, true), one('chevilles-cercles', 8, true, { note: '8 dans chaque sens.' }), one('poignets-inclinaisons', 15), one('avant-bras-rotation-libre', 10)] },
    { title: 'Épaules et colonne', items: [one('anges-au-mur', 10), one('chat-vache', 8), one('thread-the-needle', 8, true), one('w-turns', 8, true), one('worlds-greatest-stretch', 5, true)] },
    {
      title: 'Hanches et jambes',
      items: [
        one('hanches-90-90', 8, false, { note: '8 transitions, puis 30 s tenues de chaque côté.' }),
        one('rotation-interne-hanche', 6, true),
        one('balances-jambes', 10, true, { note: '10 d’avant en arrière, puis 10 sur le côté.' }),
        one('chien-tete-bas-pedale', 10, true),
        one('t-squat', 6, true),
      ],
    },
    { title: 'Intégration', items: [one('pas-chasse-rotation', 8, true), one('rotation-posture', 10)] },
  ],
};

// ---------------------------------------------------------------------------
// Échauffements

/** Avant la pliométrie et la course de qualité : corde, renforcement anti-périostite, mobilité dynamique. */
function warmLower(info: WeekInfo): Block[] {
  const rope = bl(info, [120, 150, 180, 150, 120]);
  const big = bl(info, [12, 15, 15, 12, 12]);
  return [
    { title: 'Échauffement', items: [hold('corde-a-sauter', rope, false, { note: 'Petits sauts souples, sans forcer.' })] },
    {
      title: 'Tibias et pieds',
      items: [
        one('mollets-genou-flechi', big, true),
        one('mollets-excentriques', bl(info, [6, 8, 8, 6, 6]), true, { note: 'Descente sur une jambe en 3 à 4 secondes.' }),
        one('releves-tibia', bl(info, [15, 20, 20, 15, 15])),
        one('tibial-posterieur', big, true),
        hold('pied-court', 20, true),
        one('abduction-couchee', big, true),
      ],
    },
    { title: 'Mobilité dynamique', items: [one('balances-jambes', 10, true), one('fentes-marchees', 5, true), hold('montees-genoux', 20)] },
  ];
}

function warmUpper(): Block {
  return {
    title: 'Échauffement',
    items: [hold('corde-a-sauter', 90), one('passages-epaules', 10), one('tractions-omoplates', 6), one('pompes-inclinees', 8)],
  };
}

const MB_NOTE = 'Sans médecine-ball : rotations explosives à l’élastique.';

// ---------------------------------------------------------------------------
// Les quatre séances de musculation

function muscu(info: WeekInfo, base: Omit<Session, 'kind' | 'minutes' | 'blocks'>, blocks: Block[]): Session {
  const kept = withAdjust(info, base.id, dedupe(blocks));
  return { ...base, kind: 'muscu', blocks: kept, minutes: estimateMinutes(kept) };
}

function basA(info: WeekInfo): Session {
  const plio: Item[] = bl(info, [
    [
      { ex: 'pogos', sets: 3, reps: wk(info, [10, 12, 15, 10]), rest: 60, contacts: 1 },
      { ex: 'squat-jumps', sets: wk(info, [4, 4, 5, 3]), reps: wk(info, [4, 5, 5, 4]), rest: 75, contacts: 1, note: 'Réception stabilisée 2 secondes à chaque saut.' },
    ],
    [
      { ex: 'pogos', sets: 3, reps: wk(info, [15, 15, 20, 12]), rest: 60, contacts: 1 },
      { ex: 'squat-jumps', sets: wk(info, [4, 5, 5, 3]), reps: 5, rest: 75, contacts: 1, note: 'Sauts enchaînés, le plus haut possible.' },
      { ex: 'sauts-groupes', sets: 3, reps: wk(info, [4, 5, 5, 4]), rest: 90, contacts: 1 },
    ],
    [
      { ex: 'pogos', sets: 2, reps: 15, rest: 60, contacts: 1 },
      { ex: 'sauts-contrebas', sets: wk(info, [4, 4, 5, 3]), reps: 4, rest: 90, contacts: 1 },
      { ex: 'sauts-groupes', sets: 3, reps: wk(info, [5, 6, 6, 4]), rest: 90, contacts: 1 },
    ],
    [
      { ex: 'pogos', sets: 2, reps: 12, rest: 60, contacts: 1 },
      { ex: 'sauts-contrebas', sets: 3, reps: 4, rest: 120, contacts: 1 },
    ],
    [
      { ex: 'pogos', sets: 2, reps: 10, rest: 60, contacts: 1 },
      { ex: 'squat-jumps', sets: 3, reps: 3, rest: 90, contacts: 1, note: 'Chaque saut à fond.' },
    ],
  ]);
  const sprint: Item = bl(info, [
    { ex: 'sprints', sets: wk(info, [4, 4, 5, 3]), reps: 1, rest: 90, label: `${wk(info, [4, 4, 5, 3])} x 20 m à 85 %`, note: 'Accélérations franches, pas encore à fond.' },
    { ex: 'sprints', sets: wk(info, [5, 6, 7, 4]), reps: 1, rest: 120, label: `${wk(info, [5, 6, 7, 4])} x 20 m à fond` },
    { ex: 'sprints', sets: wk(info, [5, 5, 6, 4]), reps: 1, rest: 150, label: `${wk(info, [5, 5, 6, 4])} x 30 m à fond`, note: 'Repos complet : chaque sprint doit être le plus rapide.' },
    { ex: 'sprints', sets: 4, reps: 1, rest: 150, label: '4 x 20 m à fond' },
    { ex: 'sprints', sets: 4, reps: 1, rest: 120, label: '4 x 20 m à fond' },
  ]);
  const s = (n: number) => lighten(info, n);
  const force: Item[] = bl(info, [
    [
      { ex: 'squat-elastique', sets: s(3), reps: wk(info, [10, 12, 12, 10]), rest: 75, equip: 'elastique', note: 'Descente en 3 secondes, montée rapide.' },
      { ex: 'souleve-elastique', sets: s(3), reps: wk(info, [10, 12, 12, 10]), rest: 75, equip: 'elastique' },
      { ex: 'pont-fessier', sets: s(3), reps: 15, rest: 45 },
      { ex: 'nordic-negatif', sets: s(3), reps: wk(info, [3, 3, 4, 3]), rest: 90, adjustKey: 'nordic' },
    ],
    [
      { ex: 'squat-elastique', sets: s(4), reps: wk(info, [8, 8, 6, 6]), rest: 90, equip: 'elastique', note: 'Élastique plus dur qu’au bloc précédent, montée explosive.' },
      { ex: 'souleve-elastique', sets: s(4), reps: 8, rest: 90, equip: 'elastique' },
      { ex: 'hip-thrust', sets: s(3), reps: 10, perSide: true, rest: 60 },
      { ex: 'nordic-negatif', sets: s(3), reps: wk(info, [4, 4, 5, 3]), rest: 90, adjustKey: 'nordic' },
    ],
    [
      { ex: 'squat-elastique', sets: s(4), reps: 5, rest: 120, equip: 'elastique', note: 'Contraste : enchaîne aussitôt 3 squat jumps à fond après chaque série.' },
      { ex: 'souleve-elastique', sets: s(3), reps: 6, rest: 90, equip: 'elastique' },
      { ex: 'nordic-negatif', sets: s(3), reps: 5, rest: 120, adjustKey: 'nordic' },
      { ex: 'hip-thrust', sets: s(3), reps: 8, perSide: true, rest: 60 },
    ],
    [
      { ex: 'squat-elastique', sets: 3, reps: 5, rest: 120, equip: 'elastique', note: 'Montée la plus rapide possible.' },
      { ex: 'nordic-negatif', sets: 2, reps: 4, rest: 120, adjustKey: 'nordic' },
      { ex: 'souleve-elastique', sets: 2, reps: 6, rest: 90, equip: 'elastique' },
    ],
    [
      { ex: 'squat-elastique', sets: 2, reps: 6, rest: 90, equip: 'elastique' },
      { ex: 'nordic-negatif', sets: 2, reps: 3, rest: 120, adjustKey: 'nordic' },
      { ex: 'hip-thrust', sets: 2, reps: 8, perSide: true, rest: 60 },
    ],
  ]);
  const blocks: Block[] = [...warmLower(info)];
  if (info.light) {
    blocks.push({
      title: 'Tests de puissance',
      items: [
        { ex: 'test-detente', sets: 1, rest: 120, test: 'detente', label: '3 essais, garde le meilleur' },
        { ex: 'test-longueur', sets: 1, rest: 120, test: 'longueur', label: '3 essais, garde le meilleur' },
        { ex: 'test-sprint', sets: 1, rest: 180, test: 'sprint20', label: '2 essais, garde le meilleur' },
      ],
    });
  }
  blocks.push({ title: 'Pliométrie verticale', items: plio });
  if (!info.light) blocks.push({ title: 'Sprints', items: [sprint] });
  blocks.push({ title: 'Force', items: force });
  blocks.push({ title: 'Gainage et dos', items: [{ ex: 'curl-up', sets: 3, reps: 5, rest: 30, note: 'Tiens 8 secondes chaque répétition.' }, { ex: 'bird-dog', sets: 2, reps: 6, perSide: true, rest: 30 }] });
  return muscu(
    info,
    {
      id: 'bas-a',
      title: 'Bas A : vertical et vitesse',
      anim: 'tuckJump',
      legs: true,
      intro: info.light ? 'Semaine allégée : tests de puissance après l’échauffement, puis une séance réduite.' : 'Les sauts et les sprints d’abord, frais, chaque répétition à fond avec un repos complet. La force ensuite.',
    },
    blocks,
  );
}

function hautA(info: WeekInfo): Session {
  const s = (n: number) => lighten(info, n);
  const lancers: Item[] = bl(info, [
    [{ ex: 'lancer-rotatif', sets: s(3), reps: 5, perSide: true, rest: 60, equip: 'medecine-ball', note: MB_NOTE }],
    [
      { ex: 'lancer-rotatif', sets: s(4), reps: 5, perSide: true, rest: 60, equip: 'medecine-ball', note: MB_NOTE },
      { ex: 'lancer-pousse-rotatif', sets: s(3), reps: 4, perSide: true, rest: 60, equip: 'medecine-ball' },
    ],
    [
      { ex: 'lancer-rotatif', sets: s(5), reps: 4, perSide: true, rest: 75, equip: 'medecine-ball', note: 'Chaque lancer à intensité maximale.' },
      { ex: 'lancer-pousse-rotatif', sets: s(3), reps: 4, perSide: true, rest: 75, equip: 'medecine-ball' },
    ],
    [{ ex: 'lancer-rotatif', sets: 3, reps: 4, perSide: true, rest: 75, equip: 'medecine-ball' }],
    [{ ex: 'lancer-rotatif', sets: 3, reps: 4, perSide: true, rest: 75, equip: 'medecine-ball' }],
  ]);
  const force: Item[] = bl(info, [
    [
      { ex: 'tractions-assistees', sets: s(4), reps: wk(info, [5, 6, 6, 5]), rest: 90, equip: 'elastique' },
      { ex: 'tractions-negatives', sets: s(3), reps: 3, rest: 90, note: 'Descente en 5 secondes.', adjustKey: 'negatives' },
      { ex: 'rowing-inverse', sets: s(3), reps: wk(info, [8, 10, 10, 8]), rest: 75, adjustKey: 'rowing-inverse' },
      { ex: 'rowing-un-bras', sets: s(3), reps: 12, perSide: true, rest: 45, equip: 'elastique' },
      { ex: 'pompes', sets: s(3), reps: 8, rest: 75, adjustKey: 'pompes' },
    ],
    [
      { ex: 'tractions-strictes', sets: s(5), reps: wk(info, [2, 2, 3, 2]), rest: 120, adjustKey: 'tractions', note: 'Si une série ne passe pas, finis-la avec l’élastique.' },
      { ex: 'tractions-assistees', sets: s(3), reps: 6, rest: 90, equip: 'elastique' },
      { ex: 'rowing-inverse', sets: s(4), reps: 8, rest: 75, note: 'Pieds surélevés si c’est facile.', adjustKey: 'rowing-inverse' },
      { ex: 'rowing-un-bras', sets: s(3), reps: 10, perSide: true, rest: 45, equip: 'elastique' },
      { ex: 'pompes-pieds-sureleves', sets: s(3), reps: 8, rest: 75, adjustKey: 'pompes-pieds' },
    ],
    [
      { ex: 'tractions-strictes', sets: s(5), reps: 3, rest: 120, note: 'Montée la plus rapide possible.', adjustKey: 'tractions' },
      { ex: 'rowing-inverse', sets: s(3), reps: 6, rest: 90, note: 'Montée explosive.', adjustKey: 'rowing-inverse' },
      { ex: 'rowing-un-bras', sets: s(3), reps: 8, perSide: true, rest: 45, equip: 'elastique' },
    ],
    [
      { ex: 'tractions-strictes', sets: 3, reps: 3, rest: 120, adjustKey: 'tractions' },
      { ex: 'rowing-inverse', sets: 3, reps: 6, rest: 90, adjustKey: 'rowing-inverse' },
    ],
    [
      { ex: 'tractions-strictes', sets: 3, reps: 3, rest: 120, adjustKey: 'tractions' },
      { ex: 'rowing-inverse', sets: 2, reps: 8, rest: 75, adjustKey: 'rowing-inverse' },
    ],
  ]);
  const epaules: Item[] = [
    { ex: 'tirage-visage', sets: 2, reps: 15, rest: 40, equip: 'elastique' },
    { ex: 'rotation-externe', sets: 2, reps: 12, perSide: true, rest: 30, equip: 'elastique' },
  ];
  const figure: Item[] = bl(info, [
    [{ ex: 'l-sit-groupe', sets: 4, hold: 10, rest: 45, max: true }, { ex: 'releves-jambes-assis', sets: 2, reps: 10, rest: 45 }],
    [{ ex: 'tuck-avance', sets: 4, hold: 10, rest: 45, max: true }, { ex: 'releves-jambes-assis', sets: 2, reps: 12, rest: 45 }],
    [{ ex: 'l-sit-une-jambe', sets: 4, hold: 6, perSide: true, rest: 45, max: true }, { ex: 'releves-jambes-assis', sets: 2, reps: 12, rest: 45 }],
    [{ ex: 'tuck-avance', sets: 3, hold: 10, rest: 45, max: true }],
    [{ ex: 'tuck-avance', sets: 3, hold: 10, rest: 45, max: true }],
  ]);
  const blocks: Block[] = [warmUpper()];
  if (info.light) {
    blocks.push({
      title: 'Tests de force',
      items: [
        { ex: 'test-tractions', sets: 1, rest: 180, test: 'tractions', label: 'Une série au maximum' },
        { ex: 'test-pompes', sets: 1, rest: 120, test: 'pompes', label: 'Une série au maximum' },
      ],
    });
  }
  blocks.push(
    { title: 'Lancers', items: lancers },
    { title: 'Force : tirage', items: force },
    { title: 'Épaules', items: epaules },
    { title: 'Figure : L-sit (10 min)', items: figure },
    { title: 'Gainage', items: [{ ex: 'pallof-press', sets: 3, reps: 10, perSide: true, rest: 30, equip: 'elastique' }, { ex: 'dead-bug', sets: 2, reps: 6, perSide: true, rest: 30 }] },
  );
  return muscu(
    info,
    {
      id: 'haut-a',
      title: 'Haut A : lancers et tirage',
      anim: 'mbRotThrow',
      intro: info.light
        ? 'Semaine allégée : tests de tractions et de pompes après l’échauffement, puis une séance réduite.'
        : 'Les lancers d’abord, frais : chaque lancer est un effort maximal qui part des hanches. Ensuite le tirage, avec une ou deux répétitions en réserve.',
    },
    blocks,
  );
}

function basB(info: WeekInfo): Session {
  const s = (n: number) => lighten(info, n);
  const plio: Item[] = bl(info, [
    [
      { ex: 'bonds-longueur', sets: wk(info, [4, 4, 5, 3]), reps: 3, rest: 75, contacts: 1, note: 'Réception stabilisée à chaque bond.' },
      { ex: 'sauts-lateraux', sets: 3, reps: wk(info, [4, 5, 5, 4]), perSide: true, rest: 60, contacts: 1, note: 'Tiens la réception sur une jambe.' },
      { ex: 'sauts-lateraux-joints', sets: 3, reps: wk(info, [8, 10, 10, 8]), rest: 60, contacts: 1 },
    ],
    [
      { ex: 'bonds-enchaines', sets: wk(info, [4, 4, 5, 3]), reps: 1, rest: 90, contacts: 3, label: `${wk(info, [4, 4, 5, 3])} x 3 bonds` },
      { ex: 'sauts-lateraux', sets: 3, reps: 6, perSide: true, rest: 60, contacts: 1, note: 'Enchaîné, sans pause.' },
      { ex: 'cloche-pied', sets: 3, reps: wk(info, [3, 4, 4, 3]), perSide: true, rest: 75, contacts: 1 },
    ],
    [
      { ex: 'bonds-enchaines', sets: wk(info, [5, 5, 6, 3]), reps: 1, rest: 120, contacts: 3, label: `${wk(info, [5, 5, 6, 3])} x 3 bonds, distance maximale` },
      { ex: 'sauts-lateraux', sets: 3, reps: 6, perSide: true, rest: 75, contacts: 1 },
      { ex: 'cloche-pied', sets: 3, reps: 5, perSide: true, rest: 90, contacts: 1 },
    ],
    [
      { ex: 'bonds-enchaines', sets: 3, reps: 1, rest: 120, contacts: 3, label: '3 x 3 bonds' },
      { ex: 'sauts-lateraux', sets: 3, reps: 4, perSide: true, rest: 75, contacts: 1 },
    ],
    [
      { ex: 'bonds-longueur', sets: 3, reps: 2, rest: 90, contacts: 1 },
      { ex: 'sauts-lateraux', sets: 2, reps: 4, perSide: true, rest: 75, contacts: 1 },
    ],
  ]);
  const force: Item[] = bl(info, [
    [
      { ex: 'fentes-bulgares', sets: s(3), reps: wk(info, [8, 10, 10, 8]), perSide: true, rest: 75, adjustKey: 'bulgares' },
      { ex: 'souleve-une-jambe', sets: s(3), reps: 10, perSide: true, rest: 60, equip: 'elastique' },
      { ex: 'fente-laterale', sets: s(3), reps: 8, perSide: true, rest: 60 },
      { ex: 'copenhagen', sets: s(3), hold: wk(info, [15, 20, 20, 15]), perSide: true, rest: 40, note: 'Genou sur la chaise pour commencer.' },
    ],
    [
      { ex: 'fentes-bulgares', sets: s(4), reps: 8, perSide: true, rest: 90, equip: 'elastique' },
      { ex: 'souleve-une-jambe', sets: s(4), reps: 8, perSide: true, rest: 60, equip: 'elastique' },
      { ex: 'cossack', sets: s(3), reps: 6, perSide: true, rest: 60 },
      { ex: 'copenhagen', sets: s(3), hold: wk(info, [20, 20, 25, 15]), perSide: true, rest: 40, note: 'Pied sur la chaise.' },
    ],
    [
      { ex: 'fentes-bulgares', sets: s(3), reps: 6, perSide: true, rest: 90, equip: 'elastique', note: 'Contraste : enchaîne 3 fentes sautées par jambe après chaque série.' },
      { ex: 'souleve-une-jambe', sets: s(3), reps: 6, perSide: true, rest: 60, equip: 'elastique' },
      { ex: 'cossack', sets: s(3), reps: 6, perSide: true, rest: 60 },
      { ex: 'copenhagen', sets: s(3), hold: 25, perSide: true, rest: 40 },
    ],
    [
      { ex: 'fentes-bulgares', sets: 3, reps: 6, perSide: true, rest: 90, equip: 'elastique' },
      { ex: 'cossack', sets: 2, reps: 6, perSide: true, rest: 60 },
      { ex: 'copenhagen', sets: 2, hold: 20, perSide: true, rest: 40 },
    ],
    [
      { ex: 'fentes-bulgares', sets: 2, reps: 8, perSide: true, rest: 75, equip: 'elastique' },
      { ex: 'souleve-une-jambe', sets: 2, reps: 8, perSide: true, rest: 60, equip: 'elastique' },
      { ex: 'copenhagen', sets: 2, hold: 20, perSide: true, rest: 40 },
    ],
  ]);
  const figure: Item[] = bl(info, [
    [{ ex: 'pistol-chaise', sets: 3, reps: 5, perSide: true, rest: 60 }],
    [{ ex: 'pistol-assiste', sets: 3, reps: 5, perSide: true, rest: 60 }],
    [{ ex: 'pistol-negatif', sets: 3, reps: 4, perSide: true, rest: 75 }],
    [{ ex: 'pistol-boite', sets: 3, reps: 4, perSide: true, rest: 60 }],
    [{ ex: 'pistol-boite', sets: 3, reps: 4, perSide: true, rest: 60 }],
  ]);
  return muscu(
    info,
    {
      id: 'bas-b',
      title: 'Bas B : latéral et unilatéral',
      anim: 'skater',
      legs: true,
      intro: 'Les bonds et les sauts latéraux d’abord : au swing, le poids passe d’un pied à l’autre, c’est ce transfert qu’on entraîne. Ensuite la force sur une jambe.',
    },
    [
      ...warmLower(info),
      { title: 'Pliométrie horizontale et latérale', items: plio },
      { title: 'Figure : pistol (10 min)', items: figure },
      { title: 'Force sur une jambe', items: force },
      { title: 'Gainage', items: [{ ex: 'pallof-press', sets: 3, reps: 10, perSide: true, rest: 30, equip: 'elastique' }, { ex: 'gainage-lateral', sets: 2, hold: 30, perSide: true, rest: 30 }] },
    ],
  );
}

function hautB(info: WeekInfo): Session {
  const s = (n: number) => lighten(info, n);
  const lancers: Item[] = bl(info, [
    [
      { ex: 'lancer-poitrine', sets: s(3), reps: 6, rest: 60, equip: 'medecine-ball' },
      { ex: 'lancer-au-dessus', sets: s(3), reps: 6, rest: 60, equip: 'medecine-ball' },
      { ex: 'lancer-rotatif', sets: 2, reps: 5, perSide: true, rest: 60, equip: 'medecine-ball', note: MB_NOTE },
    ],
    [
      { ex: 'lancer-poitrine', sets: s(4), reps: 5, rest: 60, equip: 'medecine-ball' },
      { ex: 'lancer-au-dessus', sets: s(4), reps: 5, rest: 60, equip: 'medecine-ball' },
      { ex: 'lancer-rotatif', sets: 2, reps: 5, perSide: true, rest: 60, equip: 'medecine-ball', note: MB_NOTE },
    ],
    [
      { ex: 'lancer-poitrine', sets: s(4), reps: 5, rest: 75, equip: 'medecine-ball' },
      { ex: 'lancer-au-dessus', sets: s(4), reps: 5, rest: 75, equip: 'medecine-ball' },
      { ex: 'lancer-rotatif', sets: 3, reps: 4, perSide: true, rest: 75, equip: 'medecine-ball' },
    ],
    [
      { ex: 'lancer-poitrine', sets: 3, reps: 5, rest: 75, equip: 'medecine-ball' },
      { ex: 'lancer-rotatif', sets: 2, reps: 4, perSide: true, rest: 75, equip: 'medecine-ball' },
    ],
    [
      { ex: 'lancer-poitrine', sets: 3, reps: 5, rest: 75, equip: 'medecine-ball' },
      { ex: 'lancer-rotatif', sets: 2, reps: 4, perSide: true, rest: 75, equip: 'medecine-ball' },
    ],
  ]);
  const force: Item[] = bl(info, [
    [
      { ex: 'pompes-lentes', sets: s(4), reps: wk(info, [6, 8, 8, 6]), rest: 75, note: 'Descente en 3 secondes.', adjustKey: 'pompes-lentes' },
      { ex: 'developpe-epaules', sets: s(3), reps: 10, rest: 60, equip: 'elastique' },
      { ex: 'pike-push-ups', sets: s(3), reps: 6, rest: 75, adjustKey: 'pike' },
      { ex: 'rowing-elastique', sets: s(3), reps: 12, rest: 45, equip: 'elastique' },
      { ex: 'turkish-get-up', sets: 2, reps: 2, perSide: true, rest: 45, equip: 'kettlebell' },
    ],
    [
      { ex: 'pompes-pieds-sureleves', sets: s(4), reps: 8, rest: 75, adjustKey: 'pompes-pieds' },
      { ex: 'pike-push-ups', sets: s(4), reps: 6, rest: 75, adjustKey: 'pike' },
      { ex: 'developpe-epaules', sets: s(3), reps: 8, rest: 60, equip: 'elastique' },
      { ex: 'tractions-supination', sets: s(3), reps: 5, rest: 90, equip: 'elastique' },
      { ex: 'turkish-get-up', sets: 3, reps: 2, perSide: true, rest: 45, equip: 'kettlebell' },
    ],
    [
      { ex: 'pompes-explosives', sets: s(4), reps: 5, rest: 90, adjustKey: 'pompes-explosives' },
      { ex: 'pike-push-ups', sets: s(3), reps: 6, rest: 75, adjustKey: 'pike' },
      { ex: 'developpe-epaules', sets: s(3), reps: 6, rest: 60, equip: 'elastique' },
      { ex: 'rowing-elastique', sets: s(3), reps: 8, rest: 45, equip: 'elastique' },
      { ex: 'turkish-get-up', sets: 2, reps: 2, perSide: true, rest: 45, equip: 'kettlebell' },
    ],
    [
      { ex: 'pompes-explosives', sets: 3, reps: 5, rest: 90, adjustKey: 'pompes-explosives' },
      { ex: 'pike-push-ups', sets: 2, reps: 6, rest: 75, adjustKey: 'pike' },
      { ex: 'rowing-elastique', sets: 2, reps: 10, rest: 45, equip: 'elastique' },
    ],
    [
      { ex: 'pompes', sets: 3, reps: 8, rest: 75, adjustKey: 'pompes' },
      { ex: 'pike-push-ups', sets: 2, reps: 6, rest: 75, adjustKey: 'pike' },
      { ex: 'rowing-elastique', sets: 2, reps: 10, rest: 45, equip: 'elastique' },
    ],
  ]);
  const figure: Item[] = bl(info, [
    [{ ex: 'poirier-mur', sets: 4, hold: 30, rest: 60, max: true }],
    [{ ex: 'poirier-mur', sets: 3, hold: 40, rest: 60, max: true }, { ex: 'poirier-decollages', sets: 3, hold: 5, rest: 45 }],
    [{ ex: 'poirier-decollages', sets: 4, hold: 8, rest: 45, max: true }],
    [{ ex: 'poirier-mur', sets: 3, hold: 30, rest: 60, max: true }],
    [{ ex: 'poirier-mur', sets: 3, hold: 30, rest: 60, max: true }],
  ]);
  const blocks: Block[] = [warmUpper()];
  if (info.light) {
    blocks.push({
      title: 'Tests de lancer',
      items: [
        { ex: 'test-lancer-rotatif', sets: 1, rest: 90, test: 'lancer-rot-fort', label: 'Côté fort : 3 essais' },
        { ex: 'test-lancer-rotatif', sets: 1, rest: 90, test: 'lancer-rot-faible', label: 'Côté faible : 3 essais' },
        { ex: 'test-lancer-poitrine', sets: 1, rest: 90, test: 'lancer-poitrine', label: '3 essais, garde le meilleur' },
      ],
    });
  }
  blocks.push(
    { title: 'Lancers', items: lancers },
    { title: 'Force : poussée', items: force },
    { title: 'Figure : poirier (10 min)', items: figure },
    { title: 'Gainage', items: [{ ex: 'gainage-lateral', sets: 2, hold: 30, perSide: true, rest: 30 }, { ex: 'bird-dog', sets: 2, reps: 6, perSide: true, rest: 30 }] },
  );
  return muscu(
    info,
    {
      id: 'haut-b',
      title: 'Haut B : lancers et poussée',
      anim: 'mbChest',
      intro: info.light
        ? 'Semaine allégée : tests de lancer au médecine-ball après l’échauffement, puis une séance réduite.'
        : 'Lancers poitrine et au-dessus de la tête d’abord, puis la poussée. La stabilité de l’épaule (Turkish get-up, rowing) protège ton swing.',
    },
    blocks,
  );
}

// ---------------------------------------------------------------------------
// Course

const WARMUP = 15;
const COOLDOWN = 10;

const spoken = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${s}` : `${m} min`;
};

function intervals(reps: number, fast: number, jog: number, fastLabel: string, jogLabel: string): Phase[] {
  const phases: Phase[] = [];
  for (let i = 1; i <= reps; i += 1) {
    phases.push({ label: `${fastLabel}, ${i} sur ${reps}`, seconds: fast, fast: true });
    if (i < reps) phases.push({ label: jogLabel, seconds: jog });
  }
  return phases;
}

function footing(info: WeekInfo): Session {
  const minutes = bl(info, [wk(info, [35, 40, 45, 30]), wk(info, [40, 45, 50, 30]), wk(info, [40, 45, 45, 30]), wk(info, [40, 30]), wk(info, [35, 40, 40, 30])]);
  const strides = info.b >= 1 && !info.light;
  return {
    id: 'footing',
    kind: 'course',
    title: 'Footing facile',
    minutes: minutes + (strides ? 5 : 0),
    anim: 'run',
    run: true,
    intro: 'Toujours facile : une allure où tu peux parler, autour de 6 min 40 au km. C’est ce qui construit l’endurance sans fatiguer tes jambes pour les sauts.',
    blocks: [{ title: 'Déroulé', display: true, items: [{ ex: 'footing', sets: 1, minutes, rest: 0 }, ...(strides ? [{ ex: 'lignes-droites', sets: 4, reps: 1, rest: 0, label: '4 x 80 m' }] : [])] }],
    phases: [{ label: 'Footing en aisance', seconds: minutes * 60 }],
  };
}

type Quality = { title: string; ex: string; text: string; phases?: Phase[]; distance?: string; test?: string; intro: string };

function quality(info: WeekInfo): Session {
  const fractionne = (reps: number, fast: number, jog: number): Quality => ({
    title: 'Fractionné',
    ex: 'fractions',
    text: `${reps} x (${spoken(fast)} vite, ${spoken(jog)} trot)`,
    phases: intervals(reps, fast, jog, 'Vite', 'Trot de récupération'),
    intro: 'Les portions rapides se courent vite mais contrôlées : la dernière doit être aussi rapide que la première.',
  });
  const seuil = (reps: number, minutes: number): Quality => ({
    title: 'Allure seuil',
    ex: 'seuil',
    text: `${reps} x ${minutes} min à allure seuil, 2 min de trot`,
    phases: intervals(reps, minutes * 60, 120, 'Allure seuil', 'Trot'),
    intro: 'Allure soutenue mais tenable, autour de ton allure sur 10 km. Régulier du début à la fin.',
  });
  const cotes = (reps: number, seconds: number): Quality => ({
    title: 'Côtes',
    ex: 'cotes',
    text: `${reps} x ${seconds} s en côte, retour en trottinant`,
    phases: intervals(reps, seconds, 90, 'Montée', 'Retour en trottinant'),
    intro: 'Monte vite, genoux hauts, buste légèrement penché. C’est de la puissance en course avec peu d’impact.',
  });
  const cinq: Quality = {
    title: 'Test 5 km',
    ex: 'course-allure',
    text: '5 km le plus vite possible, allure régulière',
    distance: '5 km',
    test: 'cinq-km',
    intro: 'Semaine de tests : 5 km à fond sur du plat. Ne pars pas trop vite. Le temps saisi alimente ton record.',
  };
  const dix: Quality = {
    title: '10 km à allure soutenue',
    ex: 'course-allure',
    text: '10 km à allure soutenue et régulière',
    distance: '10 km',
    intro: 'Une fois par bloc : 10 km à bonne allure, sans aller au bout de toi. Régulier, et tu finis avec un peu de réserve.',
  };
  const q: Quality = bl(info, [
    wk(info, [fractionne(8, 60, 60), seuil(3, 8), cotes(8, 30), cinq]),
    wk(info, [fractionne(6, 120, 90), dix, cotes(10, 30), cinq]),
    wk(info, [fractionne(5, 180, 120), seuil(3, 10), cotes(8, 45), cinq]),
    wk(info, [fractionne(8, 60, 60), cinq]),
    wk(info, [fractionne(6, 120, 90), seuil(2, 10), dix, cinq]),
  ]);
  const work = q.phases ? Math.round(q.phases.reduce((n, p) => n + p.seconds, 0) / 60) : q.distance === '10 km' ? 50 : 25;
  const plan: Item[] = q.phases
    ? [
        { ex: 'footing', sets: 1, minutes: WARMUP, rest: 0, label: `${WARMUP} min de footing` },
        { ex: q.ex, sets: 1, rest: 0, label: q.text },
        { ex: 'footing', sets: 1, minutes: COOLDOWN, rest: 0, label: `${COOLDOWN} min de retour au calme` },
      ]
    : [
        { ex: 'footing', sets: 1, minutes: 10, rest: 0, label: '10 à 15 min de footing' },
        { ex: q.ex, sets: 1, rest: 0, label: q.text },
      ];
  return {
    id: 'qualite',
    kind: 'course',
    title: q.title,
    minutes: 12 + (q.phases ? WARMUP + work + COOLDOWN : work + 15),
    anim: q.ex === 'cotes' || q.ex === 'fractions' ? 'sprint' : 'run',
    legs: true,
    run: true,
    runTest: q.test,
    intro: q.intro,
    blocks: [...warmLower(info), { title: 'Déroulé', display: true, items: plan }],
    phases: q.phases ? [{ label: 'Échauffement en footing', seconds: WARMUP * 60 }, ...q.phases, { label: 'Retour au calme', seconds: COOLDOWN * 60 }] : undefined,
  };
}

// ---------------------------------------------------------------------------
// Vitesse de swing : au practice, 1 à 2 fois par semaine, sans jour fixe.

export const SPEED_PER_WEEK = 2;

function vitesse(info: WeekInfo): Session {
  const normal = bl(info, [3, 4, 4, 3, 3]);
  const opposite = bl(info, [2, 2, 3, 2, 2]);
  return {
    id: 'vitesse',
    kind: 'vitesse',
    title: 'Vitesse de swing',
    minutes: 25,
    anim: 'swingFast',
    intro: `Au practice, en début de session, après ton échauffement et avant le travail technique. Tu notes ta vitesse de club au R10.${info.light ? ' Semaine de tests : ta meilleure vitesse de la semaine fait office de test.' : ''}`,
    blocks: [
      { title: 'Échauffement', items: [{ ex: 'swings-progressifs', sets: 1, reps: 15, rest: 0, label: '15 balles, du fer 7 au driver' }] },
      {
        title: 'Overspeed',
        items: [
          { ex: 'swing-retourne', sets: normal, reps: 5, rest: 45, label: `${normal} x 5 côté habituel` },
          { ex: 'swing-retourne', sets: opposite, reps: 5, rest: 45, label: `${opposite} x 5 côté opposé` },
        ],
      },
      { title: 'Vitesse mesurée', items: [{ ex: 'drive-max', sets: 1, reps: 10, rest: 0, label: '10 drives à fond, 30 s entre chaque' }] },
    ],
  };
}

// ---------------------------------------------------------------------------
// Calendrier

/** Semaine type, lundi en premier. La mobilité s'ajoute chaque jour. */
export const SCHEDULE: string[][] = [['bas-a'], ['haut-a'], ['footing'], ['bas-b'], ['haut-b'], ['qualite'], []];

export const MOVABLE = ['bas-a', 'haut-a', 'footing', 'bas-b', 'haut-b', 'qualite'];

export const MOVE_KEY = 'deplacements';

/** Déplacements de la semaine : identifiant de séance vers jour (0 = lundi). */
export function movesFor(monday: string): Record<string, number> {
  return getEntry(getEntries(), monday, MOVE_KEY).data.moves ?? {};
}

/** Jour de la semaine où tombe une séance, déplacements compris. */
export function dayOfSession(monday: string, id: string): number {
  const moves = movesFor(monday);
  if (moves[id] !== undefined) return moves[id];
  return SCHEDULE.findIndex((ids) => ids.includes(id));
}

/** Identifiants des séances prévues un jour donné. */
export function idsFor(day: string): string[] {
  if (!weekInfo(day).started) return [];
  const monday = mondayOf(day);
  const wd = weekday(day);
  return ['mobilite', ...MOVABLE.filter((id) => dayOfSession(monday, id) === wd)];
}

/** Séance d'un jour par identifiant. */
function build(day: string, id: string): Session | undefined {
  const info = weekInfo(day);
  switch (id) {
    case 'mobilite':
      return mobilite;
    case 'bas-a':
      return basA(info);
    case 'haut-a':
      return hautA(info);
    case 'bas-b':
      return basB(info);
    case 'haut-b':
      return hautB(info);
    case 'footing':
      return footing(info);
    case 'qualite':
      return quality(info);
    case 'vitesse':
      return vitesse(info);
    default:
      return undefined;
  }
}

/** Toutes les séances prévues un jour donné. */
export function sessionsFor(day: string): Session[] {
  return idsFor(day)
    .map((id) => build(day, id))
    .filter((s): s is Session => Boolean(s));
}

/** Les séances qui comptent pour la régularité (la vitesse de swing a son propre objectif hebdomadaire). */
export const plannedFor = sessionsFor;

/** Retrouve une séance par son identifiant, telle qu'elle était prévue ce jour-là. */
export function findSession(day: string, id: string): Session | undefined {
  return build(day, id);
}

/** Séances de jambes à moins d'un jour d'écart, après déplacements. */
export function legConflicts(monday: string): string[] {
  const legs = MOVABLE.filter((id) => build(monday, id)?.legs);
  const days = legs.map((id) => ({ id, d: dayOfSession(monday, id) })).sort((a, b) => a.d - b.d);
  const warnings: string[] = [];
  for (let i = 1; i < days.length; i += 1) {
    if (days[i].d - days[i - 1].d <= 1) warnings.push(`${build(monday, days[i - 1].id)?.title} et ${build(monday, days[i].id)?.title}`);
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Tests, toutes les quatre semaines.

export interface TestDef {
  id: string;
  name: string;
  unit: 'reps' | 'cm' | 'm' | 's' | 'time';
  how: string;
  anim: string;
  lowerIsBetter?: boolean;
}

export const TESTS: TestDef[] = [
  { id: 'detente', name: 'Détente verticale', unit: 'cm', anim: 'squatjump', how: 'Méthode du mur : hauteur touchée en sautant moins hauteur bras tendu. Meilleur de 3 essais.' },
  { id: 'longueur', name: 'Saut en longueur sans élan', unit: 'cm', anim: 'broadjump', how: 'Pieds joints, de la ligne aux talons. Meilleur de 3 essais.' },
  { id: 'sprint20', name: 'Sprint 20 m', unit: 's', anim: 'sprint', lowerIsBetter: true, how: 'Départ debout, chrono vidéo. Meilleur de 2 essais.' },
  { id: 'lancer-rot-fort', name: 'Lancer rotatif, côté fort', unit: 'm', anim: 'mbShotPut', how: 'Médecine-ball de 3 kg, sans dépasser la ligne. Meilleur de 3 essais.' },
  { id: 'lancer-rot-faible', name: 'Lancer rotatif, côté faible', unit: 'm', anim: 'mbShotPut', how: 'Même test de l’autre côté.' },
  { id: 'lancer-poitrine', name: 'Lancer poitrine assis', unit: 'm', anim: 'mbChestSeated', how: 'Dos collé à la chaise, médecine-ball de 3 kg. Meilleur de 3 essais.' },
  { id: 'tractions', name: 'Tractions strictes', unit: 'reps', anim: 'pullup', how: 'Sans élastique. Bras tendus en bas, menton au-dessus de la barre.' },
  { id: 'pompes', name: 'Pompes', unit: 'reps', anim: 'pushup', how: 'D’affilée, poitrine près du sol, sans pause en haut.' },
  { id: 'cinq-km', name: '5 km', unit: 'time', anim: 'run', lowerIsBetter: true, how: 'Sur terrain plat, après 15 minutes d’échauffement.' },
];

export const TEST_BY_ID: Record<string, TestDef> = Object.fromEntries(TESTS.map((t) => [t.id, t]));
