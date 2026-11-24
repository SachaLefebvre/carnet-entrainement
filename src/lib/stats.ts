import { EXERCISES } from '../data/exercises';
import { findSession, KINDS, KIND_LABEL, plannedFor, type Kind, type Session, type TestDef } from '../data/programme';
import { addDays, diffDays, mondayOf, todayKey, weekRange } from './dates';
import { speedUnit } from './prefs';
import { getEntry, type Entries, type Entry } from './store';

export interface Count {
  done: number;
  planned: number;
}

export interface Tally {
  total: Count;
  byKind: Record<Kind, Count>;
}

export const percent = (c: Count) => (c.planned === 0 ? null : Math.round((c.done / c.planned) * 100));

const TEST_PREFIX = 'test:';
export const testKey = (id: string) => `${TEST_PREFIX}${id}`;

const split = (key: string) => {
  const at = key.indexOf('|');
  return { day: key.slice(0, at), itemId: key.slice(at + 1) };
};

/** Premier jour où une séance a été validée. Rien n'est compté comme manqué avant. */
export function firstDay(entries: Entries): string {
  const today = todayKey();
  let first = today;
  for (const [key, entry] of Object.entries(entries)) {
    const { day } = split(key);
    if (entry.done && day < first) first = day;
  }
  return first;
}

export function dayCount(entries: Entries, day: string): Count {
  const planned = plannedFor(day);
  return { done: planned.filter((s) => getEntry(entries, day, s.id).done).length, planned: planned.length };
}

const emptyTally = (): Tally => ({
  total: { done: 0, planned: 0 },
  byKind: { course: { done: 0, planned: 0 }, muscu: { done: 0, planned: 0 }, vitesse: { done: 0, planned: 0 }, mobilite: { done: 0, planned: 0 } },
});

/**
 * Compte les séances faites et prévues entre deux jours inclus.
 * Les séances d'aujourd'hui pas encore faites ne comptent pas : la journée n'est pas finie.
 */
export function tally(entries: Entries, from: string, to: string): Tally {
  const today = todayKey();
  const first = firstDay(entries);
  const start = from < first ? first : from;
  const end = to > today ? today : to;
  const result = emptyTally();
  for (let day = start; day <= end; day = addDays(day, 1)) {
    for (const session of plannedFor(day)) {
      const done = getEntry(entries, day, session.id).done;
      if (!done && day === today) continue;
      result.total.planned += 1;
      result.byKind[session.kind].planned += 1;
      if (done) {
        result.total.done += 1;
        result.byKind[session.kind].done += 1;
      }
    }
  }
  return result;
}

/** Séries de jours complets : tout ce qui était prévu a été fait. */
export function streaks(entries: Entries): { current: number; best: number } {
  const today = todayKey();
  const complete = (day: string) => {
    const c = dayCount(entries, day);
    return c.planned > 0 && c.done === c.planned;
  };
  let best = 0;
  let run = 0;
  for (let day = firstDay(entries); day <= today; day = addDays(day, 1)) {
    if (complete(day)) {
      run += 1;
      best = Math.max(best, run);
    } else if (day !== today) {
      // Aujourd'hui incomplet ne casse pas la série en cours.
      run = 0;
    }
  }
  return { current: run, best };
}

export interface WeekPoint {
  monday: string;
  count: Count;
  pct: number | null;
  km: number;
}

export function weeklySeries(entries: Entries, weeks: number): WeekPoint[] {
  const thisMonday = mondayOf(todayKey());
  return Array.from({ length: weeks }, (_, i) => {
    const monday = addDays(thisMonday, -7 * (weeks - 1 - i));
    const count = tally(entries, monday, addDays(monday, 6)).total;
    return { monday, count, pct: percent(count), km: totals(entries, monday, addDays(monday, 6)).km };
  });
}

export type DayLevel = 'none' | 0 | 1 | 2 | 3 | 4;

/** Niveau d'un jour pour le calendrier : 'none' hors période, sinon de 0 (rien) à 4 (tout). */
export function dayLevel(entries: Entries, day: string): DayLevel {
  const today = todayKey();
  if (day > today || day < firstDay(entries)) return 'none';
  const c = dayCount(entries, day);
  if (c.planned === 0) return 'none';
  if (c.done === 0) return 0;
  if (c.done === c.planned) return 4;
  return Math.max(1, Math.min(3, Math.ceil((c.done / c.planned) * 3))) as DayLevel;
}

export const daysSinceStart = (entries: Entries) => diffDays(firstDay(entries), todayKey()) + 1;

export interface DoneSession {
  day: string;
  session: Session;
  entry: Entry;
}

/** Toutes les séances validées, de la plus récente à la plus ancienne. */
export function journal(entries: Entries): DoneSession[] {
  const result: DoneSession[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const { day, itemId } = split(key);
    if (!entry.done || itemId.startsWith(TEST_PREFIX)) continue;
    const session = findSession(day, itemId);
    if (session) result.push({ day, session, entry });
  }
  return result.sort((a, b) => (a.day === b.day ? a.session.title.localeCompare(b.session.title) : a.day < b.day ? 1 : -1));
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Total des répétitions d'une séance. Les tenues en secondes ne sont pas des répétitions. */
export function sessionReps(session: Session, entry: Entry): number {
  const holds = new Set(session.blocks.flatMap((b) => b.items.filter((i) => i.hold).map((i) => i.ex)));
  return sum(Object.entries(entry.data.sets ?? {}).map(([ex, sets]) => (holds.has(ex) ? 0 : sum(sets))));
}

export interface Totals {
  sessions: number;
  seconds: number;
  reps: number;
  km: number;
}

export function totals(entries: Entries, from: string, to: string): Totals {
  const result: Totals = { sessions: 0, seconds: 0, reps: 0, km: 0 };
  for (const { day, session, entry } of journal(entries)) {
    if (day < from || day > to) continue;
    result.sessions += 1;
    // Sans durée chronométrée, on retient la durée prévue pour les courses dont le temps a été saisi.
    result.seconds += entry.data.durationSec ?? entry.data.timeSec ?? 0;
    result.reps += sessionReps(session, entry);
    result.km += entry.data.distanceKm ?? 0;
  }
  return result;
}

export interface ExerciseLog {
  day: string;
  sets: number[];
}

/** Historique d'un exercice, du plus récent au plus ancien. */
export function exerciseHistory(entries: Entries, exerciseId: string): ExerciseLog[] {
  const result: ExerciseLog[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const sets = entry.data?.sets?.[exerciseId];
    if (entry.done && sets?.length) result.push({ day: split(key).day, sets });
  }
  return result.sort((a, b) => (a.day < b.day ? 1 : -1));
}

export interface TestResult {
  day: string;
  value: number;
}

/** Résultats d'un test, du plus ancien au plus récent. */
export function testHistory(entries: Entries, testId: string): TestResult[] {
  const result: TestResult[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const { day, itemId } = split(key);
    if (itemId === testKey(testId) && typeof entry.data?.value === 'number') result.push({ day, value: entry.data.value });
  }
  return result.sort((a, b) => (a.day < b.day ? -1 : 1));
}

export function bestOf(test: TestDef, results: TestResult[]): TestResult | undefined {
  return results.reduce<TestResult | undefined>(
    (best, r) => (!best || (test.lowerIsBetter ? r.value < best.value : r.value > best.value) ? r : best),
    undefined,
  );
}

export interface RunLog {
  day: string;
  title: string;
  km: number;
  seconds: number;
}

export function runs(entries: Entries): RunLog[] {
  return journal(entries)
    .filter((d) => d.session.kind === 'course' && d.entry.data.distanceKm)
    .map((d) => ({ day: d.day, title: d.session.title, km: d.entry.data.distanceKm ?? 0, seconds: d.entry.data.timeSec ?? 0 }));
}

/** Résumé d'une séance réalisée, en une ligne. */
export function summarize(session: Session, entry: Entry): string {
  const parts: string[] = [];
  const { data } = entry;
  if (data.distanceKm) parts.push(`${formatKm(data.distanceKm)} km`);
  if (data.timeSec) parts.push(formatClock(data.timeSec));
  if (data.distanceKm && data.timeSec) parts.push(`${formatClock(data.timeSec / data.distanceKm)} au km`);
  if (data.max) parts.push(`${data.max} ${speedUnit()} au max${data.avg ? `, ${data.avg} de moyenne` : ''}`);
  if (data.durationSec) parts.push(formatMinutes(data.durationSec));
  const reps = sessionReps(session, entry);
  if (reps) parts.push(`${reps} répétitions`);
  if (!parts.length && entry.note) parts.push(entry.note);
  return parts.join(', ');
}

export const formatKm = (km: number) => km.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/** 754 → "12:34". Au-delà d'une heure : "1:02:34". */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
}

/** 2700 → "45 min", 5400 → "1 h 30". */
export function formatMinutes(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
}

const dec = (v: number, digits: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatTest(test: TestDef, value: number): string {
  switch (test.unit) {
    case 'time':
      return formatClock(value);
    case 'cm':
      return `${Math.round(value)} cm`;
    case 'm':
      return `${dec(value, 1)} m`;
    case 's':
      return `${dec(value, 2)} s`;
    default:
      return String(value);
  }
}

/** Saisie d'un résultat de test selon son unité. null si illisible. */
export function parseTest(test: TestDef, text: string): number | null {
  if (test.unit === 'time') return parseClock(text);
  const value = Number(text.trim().replace(',', '.'));
  if (text.trim() === '' || !Number.isFinite(value) || value <= 0) return null;
  if (test.unit === 'reps' || test.unit === 'cm') return Math.round(value);
  return Math.round(value * 100) / 100;
}

export const TEST_INPUT: Record<TestDef['unit'], { label: string; placeholder: string; mode: 'numeric' | 'decimal' | 'text' }> = {
  reps: { label: 'Répétitions', placeholder: '5', mode: 'numeric' },
  cm: { label: 'Centimètres', placeholder: '55', mode: 'numeric' },
  m: { label: 'Mètres', placeholder: '9,5', mode: 'decimal' },
  s: { label: 'Secondes', placeholder: '3,10', mode: 'decimal' },
  time: { label: 'Temps (min:s)', placeholder: '22:30', mode: 'text' },
};

// ---------------------------------------------------------------------------
// Poids, sommeil, vitesse de swing

export const WEIGHT_ID = 'poids';
export const SLEEP_ID = 'sommeil';
export const SPEED_ID = 'vitesse';
export const WEIGHT_START = 66;
export const WEIGHT_GOAL = 70;

export interface Point {
  day: string;
  value: number;
}

function series(entries: Entries, itemId: string, pick: (e: Entry) => number | undefined): Point[] {
  const result: Point[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const { day, itemId: id } = split(key);
    if (id !== itemId) continue;
    const value = pick(entry);
    if (typeof value === 'number' && Number.isFinite(value)) result.push({ day, value });
  }
  return result.sort((a, b) => (a.day < b.day ? -1 : 1));
}

export const weights = (entries: Entries) => series(entries, WEIGHT_ID, (e) => e.data.value);
export const swingMax = (entries: Entries) => series(entries, SPEED_ID, (e) => (e.done ? e.data.max : undefined));
export const swingAvg = (entries: Entries) => series(entries, SPEED_ID, (e) => (e.done ? e.data.avg : undefined));

/** Séances de vitesse faites dans la semaine. */
export function speedCount(entries: Entries, monday: string): number {
  let n = 0;
  for (let i = 0; i < 7; i += 1) if (getEntry(entries, addDays(monday, i), SPEED_ID).done) n += 1;
  return n;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Durée d'une nuit en minutes, coucher avant ou après minuit. */
export function nightMinutes(bed: string, wake: string): number {
  const b = toMinutes(bed);
  const w = toMinutes(wake);
  return (w - b + 24 * 60) % (24 * 60) || 24 * 60;
}

/** Écart à l'heure visée, en minutes (le coucher se compare autour de minuit). */
export function gap(actual: string, target: string): number {
  const d = Math.abs(toMinutes(actual) - toMinutes(target));
  return Math.min(d, 24 * 60 - d);
}

export interface Night {
  day: string;
  bed: string;
  wake: string;
  minutes: number;
}

export function nights(entries: Entries): Night[] {
  const result: Night[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const { day, itemId } = split(key);
    if (itemId !== SLEEP_ID || !entry.data.bed || !entry.data.wake) continue;
    result.push({ day, bed: entry.data.bed, wake: entry.data.wake, minutes: nightMinutes(entry.data.bed, entry.data.wake) });
  }
  return result.sort((a, b) => (a.day < b.day ? -1 : 1));
}

export const BED_TARGET = '00:00';
export const WAKE_TARGET = '08:00';

export interface SleepSummary {
  count: number;
  average: number;
  /** Nuits à moins de 30 minutes des horaires visés, coucher et lever. */
  onTime: number;
}

export function sleepSummary(entries: Entries, from: string, to: string): SleepSummary {
  const list = nights(entries).filter((n) => n.day >= from && n.day <= to);
  const average = list.length ? list.reduce((a, n) => a + n.minutes, 0) / list.length : 0;
  const onTime = list.filter((n) => gap(n.bed, BED_TARGET) <= 30 && gap(n.wake, WAKE_TARGET) <= 30).length;
  return { count: list.length, average, onTime };
}

export const formatHours = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, '0')}`;

export const formatKg = (kg: number) => `${kg.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kg`;

/** "12:34" ou "754" → secondes. Renvoie null si la saisie n'est pas lisible. */
export function parseClock(text: string): number | null {
  const parts = text.trim().replace(',', '.').split(/[:h]/).map((p) => p.trim());
  if (!parts.length || parts.some((p) => p === '' || Number.isNaN(Number(p)))) return null;
  const numbers = parts.map(Number);
  if (numbers.length === 1) return numbers[0] * 60;
  if (numbers.length === 2) return numbers[0] * 60 + numbers[1];
  return numbers[0] * 3600 + numbers[1] * 60 + numbers[2];
}

/** Bilan de la semaine en texte, à coller dans une conversation. */
export function weekReport(entries: Entries, monday: string): string {
  const sunday = addDays(monday, 6);
  const t = tally(entries, monday, sunday);
  const lines = [`Bilan de la semaine ${weekRange(monday)}`];
  const pct = percent(t.total);
  lines.push(`Régularité : ${t.total.done} séances sur ${t.total.planned}${pct === null ? '' : ` (${pct} %)`}`);
  for (const kind of KINDS) {
    const c = t.byKind[kind];
    if (c.planned > 0) lines.push(`${KIND_LABEL[kind]} : ${c.done} sur ${c.planned}`);
  }
  lines.push(`Vitesse de swing : ${speedCount(entries, monday)} séance(s)`);
  const sleep = sleepSummary(entries, monday, sunday);
  if (sleep.count) lines.push(`Sommeil : ${formatHours(sleep.average)} en moyenne sur ${sleep.count} nuits, ${sleep.onTime} à l’heure`);
  const w = weights(entries).filter((p) => p.day <= sunday);
  if (w.length) lines.push(`Poids : ${formatKg(w[w.length - 1].value)}`);
  const done = journal(entries).filter((d) => d.day >= monday && d.day <= sunday).reverse();
  if (done.length) lines.push('', 'Détail :');
  for (const { day, session, entry } of done) {
    const sets = Object.entries(entry.data.sets ?? {})
      .map(([ex, values]) => `${EXERCISES[ex]?.name ?? ex} ${values.join('/')}${entry.data.loads?.[ex] ? ` (${entry.data.loads[ex]})` : ''}`)
      .join(' ; ');
    const summary = summarize(session, entry);
    lines.push(`${day} ${session.title}${summary ? ` : ${summary}` : ''}${sets ? ` [${sets}]` : ''}${entry.note ? ` (note : ${entry.note})` : ''}`);
  }
  return lines.join('\n');
}
