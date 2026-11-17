import { diffDays, mondayOf, weekday } from '../lib/dates';
import { skillBlock } from '../lib/skills';

// Lundi de la première semaine du programme.
export const PROGRAM_START = '2026-11-09';
export const PROGRAM_WEEKS = 8;
export const ATHLETE = 'Sacha';

export type Kind = 'course' | 'muscu' | 'filet' | 'mobilite';

// Ordre fixe : il détermine aussi l'attribution des couleurs dans les graphiques.
export const KINDS: Kind[] = ['course', 'muscu', 'filet', 'mobilite'];

export const KIND_LABEL: Record<Kind, string> = {
  course: 'Course',
  muscu: 'Musculation',
  filet: 'Filet',
  mobilite: 'Mobilité',
};

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
}

export interface Block {
  title: string;
  items: Item[];
  /** Figure travaillée dans ce bloc (skills.ts). */
  skill?: string;
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
  /** Une séance facultative n'entre pas dans le calcul de la régularité. */
  optional?: boolean;
}

export function dose(item: Item): string {
  if (item.label) return item.label;
  const side = item.perSide ? ' par côté' : '';
  if (item.minutes) return `${item.minutes} min`;
  if (item.hold) return `${item.sets} x ${item.hold} s${item.max ? ' ou plus' : ''}${side}`;
  return `${item.sets > 1 ? `${item.sets} x ` : ''}${item.reps}${item.sets > 1 ? '' : ' répétitions'}${side}`;
}

const mob = (ex: string, reps: number, perSide = false): Item => ({ ex, sets: 1, reps, perSide, rest: 0 });

const mobilite: Session = {
  id: 'mobilite',
  kind: 'mobilite',
  title: 'Mobilité du matin',
  minutes: 12,
  anim: 'tspine',
  intro: 'Au réveil, sans forcer. Le but est de bouger dans toute l’amplitude, pas de s’étirer fort.',
  blocks: [
    { title: 'Colonne et rotation', items: [mob('chat-vache', 10), mob('rotation-thoracique', 8, true), mob('livre-ouvert', 8, true)] },
    { title: 'Hanches et chevilles', items: [mob('hanches-90-90', 8, true), mob('fente-rotation', 5, true), mob('genou-au-mur', 10, true)] },
    {
      title: 'Épaules et posture',
      items: [mob('passages-epaules', 10), { ex: 'squat-profond', sets: 2, hold: 30, rest: 15 }],
    },
  ],
};

/** Durée estimée d'une séance de musculation, arrondie à 5 minutes, échauffement compris. */
function estimateMinutes(blocks: Block[]): number {
  let seconds = 5 * 60;
  for (const item of blocks.flatMap((b) => b.items)) {
    const sides = item.perSide ? 2 : 1;
    const work = item.hold ? item.hold * sides : (item.reps ?? 8) * 3.5 * sides;
    seconds += 45 + item.sets * work + Math.max(0, item.sets - 1) * item.rest;
  }
  return Math.max(10, Math.round(seconds / 300) * 5);
}

/** Un même exercice n'apparaît qu'une fois par séance : le premier bloc qui le contient le garde. */
function dedupe(blocks: Block[]): Block[] {
  const seen = new Set<string>();
  return blocks
    .map((block) => ({ ...block, items: block.items.filter((item) => (seen.has(item.ex) ? false : (seen.add(item.ex), true))) }))
    .filter((block) => block.items.length > 0);
}

function muscu(_day: string, base: Omit<Session, 'kind' | 'minutes' | 'blocks'>, blocks: Block[]): Session {
  const kept = dedupe(blocks);
  return { ...base, kind: 'muscu', blocks: kept, minutes: estimateMinutes(kept) };
}

// Les figures : chacune a une séance principale par semaine (l'étape plus ses points faibles)
// et un ou deux rappels courts. Poirier lundi, pistol mercredi, L-sit jeudi.
function muscuSessions(day: string): Record<string, Session> {
  return {
    'haut-1': muscu(
      day,
      { id: 'haut-1', title: 'Haut du corps 1', anim: 'pullupBand', intro: 'Les figures d’abord, quand tu es frais. Ensuite, garde une ou deux répétitions en réserve sur chaque série.' },
      [
        skillBlock('poirier', day, 'main'),
        skillBlock('lsit', day, 'rappel'),
        {
          title: 'Force',
          items: [
            { ex: 'tractions-assistees', sets: 4, reps: 5, rest: 90 },
            { ex: 'tractions-negatives', sets: 3, reps: 3, rest: 90, note: 'Descente en 5 secondes.' },
            { ex: 'pompes', sets: 4, reps: 6, rest: 90 },
            { ex: 'rowing-elastique', sets: 3, reps: 12, rest: 60 },
          ],
        },
        { title: 'Abdos', items: [{ ex: 'pallof-press', sets: 3, reps: 10, perSide: true, rest: 40 }] },
      ],
    ),
    'haut-2': muscu(
      day,
      { id: 'haut-2', title: 'Haut du corps 2', anim: 'lsitFull', intro: 'Séance L-sit : les figures d’abord, puis la force avec une ou deux répétitions en réserve.' },
      [
        skillBlock('lsit', day, 'main'),
        skillBlock('poirier', day, 'rappel'),
        {
          title: 'Force',
          items: [
            { ex: 'tractions-supination', sets: 4, reps: 5, rest: 90 },
            { ex: 'pompes-lentes', sets: 4, reps: 5, rest: 90, note: 'Descente en 3 secondes.' },
            { ex: 'developpe-epaules', sets: 3, reps: 10, rest: 60 },
            { ex: 'tirage-visage', sets: 3, reps: 15, rest: 45 },
          ],
        },
        { title: 'Abdos', items: [{ ex: 'gainage-lateral', sets: 3, hold: 30, perSide: true, rest: 30 }] },
      ],
    ),
    'bas-1': muscu(
      day,
      { id: 'bas-1', title: 'Bas du corps 1 et explosivité', anim: 'squatjump', intro: 'L’explosivité se travaille frais : chaque saut et chaque sprint à fond, avec un repos complet. Le pistol vient juste après.' },
      [
        {
          title: 'Explosivité',
          items: [
            { ex: 'squat-jumps', sets: 4, reps: 5, rest: 75 },
            { ex: 'bonds-longueur', sets: 4, reps: 3, rest: 75 },
            { ex: 'sprints', sets: 6, reps: 1, rest: 90, label: '6 x 8 à 10 s', note: 'Les deux premières semaines : en côte ou à 80 %.' },
          ],
        },
        skillBlock('pistol', day, 'main'),
        {
          title: 'Force',
          items: [
            { ex: 'fentes-bulgares', sets: 3, reps: 8, perSide: true, rest: 75 },
            { ex: 'souleve-une-jambe', sets: 3, reps: 10, perSide: true, rest: 60 },
            { ex: 'mollets', sets: 3, reps: 15, perSide: true, rest: 45 },
          ],
        },
        skillBlock('poirier', day, 'rappel'),
        { title: 'Abdos', items: [{ ex: 'planche', sets: 3, hold: 40, rest: 40 }] },
      ],
    ),
    'bas-2': muscu(
      day,
      { id: 'bas-2', title: 'Bas du corps 2 et rotation', anim: 'rotation', intro: 'Séance plus légère pour les jambes, la veille de la sortie longue. L’accent est sur la rotation.' },
      [
        {
          title: 'Rotation pour le golf',
          items: [
            { ex: 'rotations-explosives', sets: 4, reps: 6, perSide: true, rest: 60 },
            { ex: 'pallof-press', sets: 3, reps: 10, perSide: true, rest: 40 },
          ],
        },
        skillBlock('pistol', day, 'rappel'),
        {
          title: 'Force',
          items: [
            { ex: 'squat-elastique', sets: 4, reps: 10, rest: 75 },
            { ex: 'hip-thrust', sets: 3, reps: 10, perSide: true, rest: 60 },
            { ex: 'releves-tibia', sets: 3, reps: 15, rest: 40 },
          ],
        },
        skillBlock('lsit', day, 'rappel'),
        { title: 'Abdos', items: [{ ex: 'gainage-lateral', sets: 3, hold: 30, perSide: true, rest: 30 }] },
      ],
    ),
  };
}

const filet: Session = {
  id: 'filet',
  kind: 'filet',
  title: 'Filet, travail technique',
  minutes: 45,
  anim: 'swing',
  intro: 'Contenu libre : c’est toi qui choisis le thème du jour. Note-le pour t’en souvenir.',
  blocks: [],
};

const tractions: Session = {
  id: 'tractions',
  kind: 'muscu',
  title: 'Tractions du jour',
  minutes: 5,
  anim: 'pullup',
  optional: true,
  intro: 'Facultatif. Deux séries faciles en passant devant la barre, loin de l’échec.',
  blocks: [{ title: 'Au choix', items: [{ ex: 'tractions-faciles', sets: 2, reps: 3, rest: 60 }] }],
};

/** Progression de course sur 8 semaines. Les semaines 4 et 8 sont allégées. */
export interface RunWeek {
  reps: number;
  /** Durée d'une fraction rapide et de sa récupération, en secondes. */
  fast: number;
  jog: number;
  facile: number;
  longue: number;
  light?: boolean;
}

export const RUN_WEEKS: RunWeek[] = [
  { reps: 8, fast: 60, jog: 60, facile: 30, longue: 50 },
  { reps: 10, fast: 60, jog: 60, facile: 30, longue: 55 },
  { reps: 6, fast: 120, jog: 90, facile: 35, longue: 60 },
  { reps: 6, fast: 60, jog: 60, facile: 30, longue: 45, light: true },
  { reps: 7, fast: 120, jog: 90, facile: 35, longue: 60 },
  { reps: 5, fast: 180, jog: 120, facile: 40, longue: 65 },
  { reps: 6, fast: 180, jog: 120, facile: 40, longue: 70 },
  { reps: 5, fast: 120, jog: 90, facile: 30, longue: 50, light: true },
];

const spoken = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s}` : `${m} min`;
};

export const intervalText = (w: RunWeek) => `${w.reps} x (${spoken(w.fast)} vite, ${spoken(w.jog)} trot)`;

/** Numéro de semaine du programme, à partir de 0. Jamais négatif. */
export function programWeek(day: string): number {
  return Math.max(0, Math.floor(diffDays(PROGRAM_START, mondayOf(day)) / 7));
}

/** Après les 8 premières semaines, on reboucle sur les semaines 5 à 8. */
export function runWeekIndex(day: string): number {
  const w = programWeek(day);
  return w < RUN_WEEKS.length ? w : 4 + (w % 4);
}

const WARMUP = 15;
const COOLDOWN = 10;

function runSessions(day: string): Record<string, Session> {
  const week = RUN_WEEKS[runWeekIndex(day)];
  const light = week.light ? ' Semaine allégée : reste facile.' : '';
  const intervals: Phase[] = [];
  for (let i = 1; i <= week.reps; i += 1) {
    intervals.push({ label: `Vite, ${i} sur ${week.reps}`, seconds: week.fast, fast: true });
    if (i < week.reps) intervals.push({ label: 'Trot de récupération', seconds: week.jog });
  }
  const work = Math.round((week.reps * week.fast + (week.reps - 1) * week.jog) / 60);
  return {
    fractionne: {
      id: 'fractionne',
      kind: 'course',
      title: 'Course fractionnée',
      minutes: WARMUP + work + COOLDOWN,
      anim: 'sprint',
      intro: `Les portions rapides se courent vite mais contrôlées, pas au sprint.${light}`,
      blocks: [
        {
          title: 'Déroulé',
          items: [
            { ex: 'footing', sets: 1, minutes: WARMUP, rest: 0, label: `${WARMUP} min d’échauffement` },
            { ex: 'fractions', sets: 1, rest: 0, label: intervalText(week) },
            { ex: 'footing', sets: 1, minutes: COOLDOWN, rest: 0, label: `${COOLDOWN} min de retour au calme` },
          ],
        },
      ],
      phases: [
        { label: 'Échauffement en footing', seconds: WARMUP * 60 },
        ...intervals,
        { label: 'Retour au calme', seconds: COOLDOWN * 60 },
      ],
    },
    facile: {
      id: 'facile',
      kind: 'course',
      title: 'Footing facile',
      minutes: week.facile + 5,
      anim: 'run',
      intro: 'Allure à laquelle tu peux parler, autour de 6 min 40 au km.',
      blocks: [
        {
          title: 'Déroulé',
          items: [
            { ex: 'footing', sets: 1, minutes: week.facile, rest: 0 },
            { ex: 'lignes-droites', sets: 4, reps: 1, rest: 0, label: '4 x 80 m' },
          ],
        },
      ],
      phases: [{ label: 'Footing en aisance', seconds: week.facile * 60 }],
    },
    longue: {
      id: 'longue',
      kind: 'course',
      title: 'Sortie longue',
      minutes: week.longue,
      anim: 'run',
      intro: `Allure facile du début à la fin. Si tu ne peux plus parler, ralentis.${light}`,
      blocks: [{ title: 'Déroulé', items: [{ ex: 'footing', sets: 1, minutes: week.longue, rest: 0 }] }],
      phases: [{ label: 'Footing en aisance', seconds: week.longue * 60 }],
    },
  };
}

const FIXED: Record<string, Session> = {
  mobilite,
  filet,
  tractions,
};

/** Planning de la semaine, lundi en premier. */
export const SCHEDULE: string[][] = [
  ['mobilite', 'haut-1', 'filet'],
  ['mobilite', 'fractionne', 'filet', 'tractions'],
  ['mobilite', 'bas-1', 'filet', 'tractions'],
  ['mobilite', 'haut-2', 'facile', 'filet'],
  ['mobilite', 'bas-2', 'filet', 'tractions'],
  ['mobilite', 'longue', 'filet', 'tractions'],
  ['mobilite', 'filet'],
];

/** Séance d'un jour par identifiant, qu'elle soit fixe, de course ou de musculation. */
function build(day: string, id: string): Session | undefined {
  if (FIXED[id]) return FIXED[id];
  if (id === 'fractionne' || id === 'facile' || id === 'longue') return runSessions(day)[id];
  return muscuSessions(day)[id];
}

/** Toutes les séances prévues un jour donné, facultatives comprises. */
export function sessionsFor(day: string): Session[] {
  return SCHEDULE[weekday(day)].map((id) => build(day, id)).filter((s): s is Session => Boolean(s));
}

/** Les séances qui comptent pour la régularité. */
export function plannedFor(day: string): Session[] {
  return sessionsFor(day).filter((s) => !s.optional);
}

/** Retrouve une séance par son identifiant, telle qu'elle était prévue ce jour-là. */
export function findSession(day: string, id: string): Session | undefined {
  return build(day, id);
}

export const exerciseCount = (session: Session) => session.blocks.reduce((n, block) => n + block.items.length, 0);

/** Les tests de niveau, à refaire toutes les quatre semaines. */
export interface TestDef {
  id: string;
  name: string;
  unit: 'reps' | 'seconds' | 'time';
  how: string;
  anim: string;
  lowerIsBetter?: boolean;
}

export const TESTS: TestDef[] = [
  { id: 'tractions', name: 'Tractions strictes', unit: 'reps', anim: 'pullup', how: 'Sans élastique. Bras tendus en bas, menton au-dessus de la barre.' },
  { id: 'pompes', name: 'Pompes', unit: 'reps', anim: 'pushup', how: 'D’affilée, poitrine près du sol, sans pause en haut.' },
  { id: 'poirier', name: 'Poirier ventre au mur', unit: 'seconds', anim: 'wallwalk', how: 'Temps tenu en position haute, corps gainé.' },
  { id: 'lsit', name: 'L-sit genoux repliés', unit: 'seconds', anim: 'lsit', how: 'Temps tenu, fesses et pieds décollés.' },
  { id: 'cinq-km', name: '5 km', unit: 'time', anim: 'run', lowerIsBetter: true, how: 'Sur terrain plat, après un échauffement de 15 minutes.' },
];
