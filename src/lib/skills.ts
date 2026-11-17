import type { Block, Item } from '../data/programme';
import { SKILL_BY_ID, type Lock, type Skill, type SkillStep } from '../data/skills';
import { todayKey } from './dates';
import { getEntries, updateEntry, type Entries } from './store';

// L'état d'une figure est un journal : chaque changement d'étape ou chaque diagnostic
// est une entrée datée (`2026-11-17|figure:lsit`). L'étape d'un jour est la dernière fixée avant.

const PREFIX = 'figure:';
export const skillKey = (id: string) => `${PREFIX}${id}`;

interface Change {
  day: string;
  level?: number;
  answers?: Record<string, number>;
}

const cache = new WeakMap<Entries, Record<string, Change[]>>();

function changes(entries: Entries, id: string): Change[] {
  let byId = cache.get(entries);
  if (!byId) {
    byId = {};
    for (const [key, entry] of Object.entries(entries)) {
      const at = key.indexOf('|');
      const itemId = key.slice(at + 1);
      if (!itemId.startsWith(PREFIX)) continue;
      const skill = itemId.slice(PREFIX.length);
      (byId[skill] ??= []).push({ day: key.slice(0, at), level: entry.data?.level, answers: entry.data?.answers });
    }
    for (const list of Object.values(byId)) list.sort((a, b) => (a.day < b.day ? -1 : 1));
    cache.set(entries, byId);
  }
  return byId[id] ?? [];
}

export interface SkillState {
  level: number;
  /** Jour où l'étape actuelle a été fixée (null : étape par défaut, jamais choisie). */
  since: string | null;
  answers: Record<string, number>;
  /** Jour du dernier diagnostic. */
  diagnosed: string | null;
  /** Chaque passage d'étape, du plus ancien au plus récent. */
  history: { day: string; level: number }[];
}

export function skillState(entries: Entries, skill: Skill, day = todayKey()): SkillState {
  let level = skill.startStep(skill.defaults);
  let since: string | null = null;
  let answers = skill.defaults;
  let diagnosed: string | null = null;
  const history: { day: string; level: number }[] = [];
  for (const change of changes(entries, skill.id)) {
    if (change.day > day) break;
    if (typeof change.level === 'number') {
      const last = history[history.length - 1];
      if (!last || last.level !== change.level) history.push({ day: change.day, level: change.level });
      level = change.level;
      since = change.day;
    }
    if (change.answers) {
      answers = { ...skill.defaults, ...change.answers };
      diagnosed = change.day;
    }
  }
  return { level: Math.max(0, Math.min(level, skill.steps.length - 1)), since, answers, diagnosed, history };
}

/** Fixe l'étape (et éventuellement les réponses du diagnostic) à partir d'aujourd'hui. */
export function setSkill(skill: Skill, patch: { level?: number; answers?: Record<string, number> }) {
  const today = todayKey();
  const key = `${today}|${skillKey(skill.id)}`;
  const data = { ...(getEntries()[key]?.data ?? {}) };
  if (patch.level !== undefined) data.level = patch.level;
  if (patch.answers) data.answers = patch.answers;
  updateEntry(today, skillKey(skill.id), { data });
}

/** Verrous du plus faible au plus solide, d'après le diagnostic. */
export function priorities(skill: Skill, answers: Record<string, number>): Lock[] {
  return [...skill.locks].sort((a, b) => (answers[a.id] ?? 1) - (answers[b.id] ?? 1));
}

export function goalText(step: SkillStep): string {
  const side = step.perSide ? (step.metric === 'hold' ? ' par côté' : ' par jambe') : '';
  return step.metric === 'hold' ? `${step.targetSets} x ${step.target} s${side}` : `${step.targetSets} x ${step.target}${side}`;
}

export interface SessionLog {
  day: string;
  values: number[];
  best: number;
  /** Séries au niveau de la cible. */
  good: number;
}

/** Séances validées où cet exercice a été noté, de la plus ancienne à la plus récente. */
export function logsOf(entries: Entries, ex: string, target = Infinity): SessionLog[] {
  const result: SessionLog[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const values = entry.data?.sets?.[ex];
    if (!entry.done || !values?.length) continue;
    result.push({ day: key.slice(0, key.indexOf('|')), values, best: Math.max(...values), good: values.filter((v) => v >= target).length });
  }
  return result.sort((a, b) => (a.day < b.day ? -1 : 1));
}

export interface StepProgress {
  step: SkillStep;
  /** Séances depuis que l'étape est en cours. */
  logs: SessionLog[];
  required: number;
  /** Meilleure séance : nombre de séries au niveau de la cible. */
  bestGood: number;
  ready: boolean;
  last: boolean;
}

export function stepProgress(entries: Entries, skill: Skill, state: SkillState): StepProgress {
  const step = skill.steps[state.level];
  // Une tenue par côté est chronométrée deux fois par série.
  const required = step.targetSets * (step.perSide && step.metric === 'hold' ? 2 : 1);
  const logs = logsOf(entries, step.ex, step.target).filter((log) => !state.since || log.day >= state.since);
  const bestGood = logs.reduce((max, log) => Math.max(max, log.good), 0);
  return { step, logs, required, bestGood, ready: bestGood >= required, last: state.level === skill.steps.length - 1 };
}

function assistItem(dose: Skill['assist'][string][number]): Item {
  return { ex: dose.ex, sets: dose.sets, reps: dose.reps, hold: dose.hold, perSide: dose.perSide, rest: dose.rest, note: dose.note };
}

/**
 * Le bloc d'une figure dans une séance de musculation, à l'étape du jour.
 * Séance principale : l'étape plus deux exercices pour les points faibles. Rappel : l'étape seule.
 */
export function skillBlock(skillId: string, day: string, mode: 'main' | 'rappel'): Block {
  const skill = SKILL_BY_ID[skillId];
  const state = skillState(getEntries(), skill, day);
  const step = skill.steps[state.level];
  const practice: Item = {
    ex: step.ex,
    sets: mode === 'main' ? step.sets : Math.min(3, step.sets),
    rest: step.rest,
    perSide: step.perSide,
    ...(step.metric === 'hold' ? { hold: step.target, max: true } : { reps: step.target }),
    note: `Étape ${state.level + 1} sur ${skill.steps.length}. Objectif pour passer : ${goalText(step)}.`,
  };
  const items = [practice];
  if (mode === 'main') {
    for (const lock of priorities(skill, state.answers).slice(0, 2)) {
      const dose = skill.assist[lock.id][state.answers[lock.id] ?? 1];
      if (dose.ex !== step.ex) items.push({ ...assistItem(dose), note: dose.note ?? `Pour le verrou « ${lock.name} ».` });
    }
  }
  return {
    title: mode === 'main' ? `${skill.name} : ${step.name}` : `${skill.name}, rappel`,
    skill: skill.id,
    items,
  };
}
