// Les jours sont manipulés sous forme de clés "AAAA-MM-JJ" en heure locale.

const pad = (n: number) => String(n).padStart(2, '0');

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Midi, pour ne jamais glisser d'un jour aux changements d'heure. */
export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const todayKey = () => toKey(new Date());

export const addDays = (key: string, n: number) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

/** 0 = lundi, 6 = dimanche. */
export const weekday = (key: string) => (fromKey(key).getDay() + 6) % 7;

export const mondayOf = (key: string) => addDays(key, -weekday(key));

export const diffDays = (from: string, to: string) =>
  Math.round((fromKey(to).getTime() - fromKey(from).getTime()) / 86_400_000);

const fmt = (options: Intl.DateTimeFormatOptions) => {
  const f = new Intl.DateTimeFormat('fr-FR', options);
  return (key: string) => f.format(fromKey(key));
};

export const weekdayName = fmt({ weekday: 'long' });
export const dayAndMonth = fmt({ day: 'numeric', month: 'long' });
export const shortDate = fmt({ day: 'numeric', month: 'short' });
export const dayNumber = fmt({ day: 'numeric' });

export const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const WEEKDAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "du 9 au 15 novembre" ou "du 30 novembre au 6 décembre". */
export function weekRange(monday: string) {
  const sunday = addDays(monday, 6);
  const sameMonth = fromKey(monday).getMonth() === fromKey(sunday).getMonth();
  return `du ${sameMonth ? dayNumber(monday) : dayAndMonth(monday)} au ${dayAndMonth(sunday)}`;
}
