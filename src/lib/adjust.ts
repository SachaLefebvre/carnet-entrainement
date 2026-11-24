import { EXERCISES } from '../data/exercises';
import { findSession, type Equip, type Item } from '../data/programme';
import { todayKey } from './dates';
import { getEntry, updateEntry, type Entries } from './store';

// Le programme est écrit à l'avance, puis ajusté selon tes résultats :
// l'app propose, tu valides. Les ajustements sont rangés dans une seule entrée.

// Jour du départ du programme, écrit en dur : programme.ts importe ce module (import circulaire).
const ADJUST_DAY = '2026-11-30';
const ADJUST_ID = 'ajustements';

export const LOADS: Record<Equip, string[]> = {
  elastique: ['10 kg', '20 kg', '30 kg', '10 + 30 kg', '20 + 30 kg', '10 + 20 + 30 kg'],
  kettlebell: ['4 kg'],
  'medecine-ball': ['3 kg', 'Élastique, sans ballon'],
};

export const EQUIP_LABEL: Record<Equip, string> = {
  elastique: 'Élastique',
  kettlebell: 'Kettlebell',
  'medecine-ball': 'Médecine-ball',
};

export function adjusted(entries: Entries, key: string) {
  return getEntry(entries, ADJUST_DAY, ADJUST_ID).data.adjust?.[key];
}

const split = (key: string) => {
  const at = key.indexOf('|');
  return { day: key.slice(0, at), itemId: key.slice(at + 1) };
};

/** Dernière charge notée pour un exercice, ou celle de l'ajustement validé. */
export function lastLoad(entries: Entries, ex: string, adjustKey?: string): string | undefined {
  const adj = adjustKey ? adjusted(entries, adjustKey) : undefined;
  let best: { day: string; load: string } | undefined;
  for (const [key, entry] of Object.entries(entries)) {
    const load = entry.data?.loads?.[ex];
    if (!load) continue;
    const { day } = split(key);
    if (!best || day > best.day) best = { day, load };
  }
  if (adj?.load && (!best || adj.since >= best.day)) return adj.load;
  return best?.load;
}

export interface Suggestion {
  key: string;
  ex: string;
  day: string;
  session: string;
  direction: 'up' | 'down';
  text: string;
  why: string;
  reps?: number;
  load?: string;
}

function step(equip: Equip | undefined, load: string | undefined, direction: 1 | -1): string | undefined {
  if (!equip || equip !== 'elastique') return undefined;
  const list = LOADS.elastique;
  const index = load ? list.indexOf(load) : -1;
  if (index < 0) return undefined;
  return list[index + direction];
}

/**
 * Propositions d'ajustement à partir des séances faites entre deux jours.
 * Monter : toutes les séries au-dessus de l'objectif. Descendre : au moins deux séries nettement en dessous.
 */
export function suggestions(entries: Entries, from: string, to: string): Suggestion[] {
  const store = getEntry(entries, ADJUST_DAY, ADJUST_ID).data;
  const latest = new Map<string, { day: string; item: Item; values: number[]; session: string; load?: string }>();
  for (const [key, entry] of Object.entries(entries)) {
    const { day, itemId } = split(key);
    if (day < from || day > to || !entry.done || !entry.data.sets) continue;
    const session = findSession(day, itemId);
    if (!session || session.kind !== 'muscu') continue;
    for (const item of session.blocks.flatMap((b) => b.items)) {
      if (!item.adjustKey || item.reps === undefined) continue;
      const values = entry.data.sets[item.ex];
      if (!values?.length) continue;
      const known = latest.get(item.adjustKey);
      if (!known || day > known.day) latest.set(item.adjustKey, { day, item, values, session: session.title, load: entry.data.loads?.[item.ex] });
    }
  }
  const result: Suggestion[] = [];
  for (const [key, { day, item, values, session, load }] of latest) {
    if ((store.dismissed?.[key] ?? '') >= day) continue;
    const target = item.reps ?? 0;
    const complete = values.length >= item.sets;
    const name = EXERCISES[item.ex]?.name ?? item.ex;
    if (complete && values.every((v) => v > target)) {
      const harder = step(item.equip, load, 1);
      result.push(
        harder
          ? { key, ex: item.ex, day, session, direction: 'up', load: harder, reps: -2, text: `${name} : élastique ${harder}, 2 répétitions de moins`, why: `Toutes tes séries ont dépassé l’objectif de ${target}.` }
          : { key, ex: item.ex, day, session, direction: 'up', reps: values.every((v) => v >= target + 3) ? 2 : 1, text: `${name} : ${values.every((v) => v >= target + 3) ? 2 : 1} répétition${values.every((v) => v >= target + 3) ? 's' : ''} de plus par série`, why: `Toutes tes séries ont dépassé l’objectif de ${target}.` },
      );
    } else if (values.filter((v) => v < target - 1).length >= 2) {
      const easier = step(item.equip, load, -1);
      result.push(
        easier
          ? { key, ex: item.ex, day, session, direction: 'down', load: easier, text: `${name} : élastique ${easier}`, why: `Plusieurs séries sont restées loin de l’objectif de ${target}.` }
          : { key, ex: item.ex, day, session, direction: 'down', reps: -1, text: `${name} : une répétition de moins par série`, why: `Plusieurs séries sont restées loin de l’objectif de ${target}.` },
      );
    }
  }
  return result.sort((a, b) => (a.day < b.day ? -1 : 1));
}

export function acceptSuggestion(entries: Entries, s: Suggestion) {
  const current = getEntry(entries, ADJUST_DAY, ADJUST_ID).data;
  const previous = current.adjust?.[s.key];
  const adjust = { ...(current.adjust ?? {}), [s.key]: { reps: (previous?.reps ?? 0) + (s.reps ?? 0), load: s.load ?? previous?.load, since: todayKey() } };
  updateEntry(ADJUST_DAY, ADJUST_ID, { data: { ...current, adjust, dismissed: { ...(current.dismissed ?? {}), [s.key]: s.day } } });
}

export function dismissSuggestion(entries: Entries, s: Suggestion) {
  const current = getEntry(entries, ADJUST_DAY, ADJUST_ID).data;
  updateEntry(ADJUST_DAY, ADJUST_ID, { data: { ...current, dismissed: { ...(current.dismissed ?? {}), [s.key]: s.day } } });
}
