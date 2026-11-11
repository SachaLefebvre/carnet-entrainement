import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';

// Les coches sont d'abord écrites sur l'appareil, puis envoyées à Supabase.
// L'app reste donc utilisable hors ligne : ce qui n'a pas pu partir attend dans `pending`.

/** Ce qui a été réalisé pendant une séance, ou la valeur d'un test. */
export interface EntryData {
  /** Durée réelle de la séance, en secondes. */
  durationSec?: number;
  /** Répétitions (ou secondes tenues) par série, pour chaque exercice. */
  sets?: Record<string, number[]>;
  distanceKm?: number;
  timeSec?: number;
  /** Résultat d'un test. */
  value?: number;
}

export interface Entry {
  done: boolean;
  note: string;
  data: EntryData;
  updatedAt: string;
}

export type Entries = Record<string, Entry>;
export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline';

interface Snapshot {
  entries: Entries;
  status: SyncStatus;
  pending: number;
}

const LS_ENTRIES = 'tdb.entries.v2';
const LS_PENDING = 'tdb.pending.v2';
const PAGE = 1000;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible (navigation privée) : l'app continue en mémoire.
  }
}

let entries: Entries = read(LS_ENTRIES, {});
let pending: string[] = read(LS_PENDING, []);
let status: SyncStatus = supabase ? 'syncing' : 'local';
let userId: string | null = null;
let busy = false;
let again = false;
let snapshot: Snapshot = { entries, status, pending: pending.length };

const listeners = new Set<() => void>();

function emit() {
  snapshot = { entries, status, pending: pending.length };
  listeners.forEach((listener) => listener());
}

function persist() {
  write(LS_ENTRIES, entries);
  write(LS_PENDING, pending);
}

export const entryKey = (day: string, itemId: string) => `${day}|${itemId}`;

const EMPTY: Entry = { done: false, note: '', data: {}, updatedAt: '' };

export const getEntry = (all: Entries, day: string, itemId: string): Entry => all[entryKey(day, itemId)] ?? EMPTY;

export function updateEntry(day: string, itemId: string, patch: Partial<Omit<Entry, 'updatedAt'>>) {
  const key = entryKey(day, itemId);
  entries = { ...entries, [key]: { ...getEntry(entries, day, itemId), ...patch, updatedAt: new Date().toISOString() } };
  if (!pending.includes(key)) pending = [...pending, key];
  persist();
  emit();
  schedulePush();
}

let pushTimer: ReturnType<typeof setTimeout> | undefined;

function schedulePush() {
  if (!supabase || !userId) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void sync(false), 600);
}

async function push(): Promise<boolean> {
  if (!supabase || !userId || pending.length === 0) return true;
  const keys = [...pending];
  const sent = new Map(keys.map((key) => [key, entries[key].updatedAt]));
  const rows = keys.map((key) => {
    const [day, item_id] = key.split('|');
    const entry = entries[key];
    return { user_id: userId, day, item_id, done: entry.done, note: entry.note, data: entry.data, updated_at: entry.updatedAt };
  });
  const { error } = await supabase.from('completions').upsert(rows, { onConflict: 'user_id,day,item_id' });
  if (error) return false;
  // Une entrée modifiée pendant l'envoi reste en attente.
  pending = pending.filter((key) => !sent.has(key) || entries[key].updatedAt !== sent.get(key));
  persist();
  return true;
}

async function pull(): Promise<boolean> {
  if (!supabase || !userId) return true;
  const merged = { ...entries };
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('completions')
      .select('day,item_id,done,note,data,updated_at')
      .order('day')
      .order('item_id')
      .range(from, from + PAGE - 1);
    if (error) return false;
    for (const row of data) {
      const key = entryKey(row.day, row.item_id);
      const local = merged[key];
      const remoteIsNewer = !local || Date.parse(row.updated_at) > Date.parse(local.updatedAt);
      if (remoteIsNewer || !pending.includes(key)) {
        merged[key] = { done: row.done, note: row.note ?? '', data: row.data ?? {}, updatedAt: row.updated_at };
      }
    }
    if (data.length < PAGE) break;
  }
  entries = merged;
  persist();
  return true;
}

/** Envoie ce qui attend, puis récupère ce qui a changé sur un autre appareil. */
export async function sync(withPull = true) {
  if (!supabase || !userId) return;
  if (busy) {
    again = true;
    return;
  }
  busy = true;
  status = 'syncing';
  emit();
  let ok = false;
  try {
    ok = (await push()) && (!withPull || (await pull()));
  } catch {
    ok = false;
  }
  status = ok ? 'synced' : 'offline';
  busy = false;
  emit();
  if (again) {
    again = false;
    void sync(false);
  }
}

export function setUser(id: string | null) {
  if (id === userId) return;
  userId = id;
  if (id) void sync();
}

/** À la déconnexion, les données quittent l'appareil. Elles restent dans Supabase. */
export function clearLocal() {
  entries = {};
  pending = [];
  persist();
  emit();
}

if (supabase && typeof window !== 'undefined') {
  window.addEventListener('online', () => void sync());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void sync();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useStore(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot);
}
