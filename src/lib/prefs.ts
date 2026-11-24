// Préférences de l'appareil (unité de vitesse). Gardées dans le navigateur, sans importance pour la synchronisation.

export type SpeedUnit = 'km/h' | 'mph';

const KEY = 'tdb.speedUnit';

export function speedUnit(): SpeedUnit {
  try {
    return localStorage.getItem(KEY) === 'mph' ? 'mph' : 'km/h';
  } catch {
    return 'km/h';
  }
}

export function setSpeedUnit(unit: SpeedUnit) {
  try {
    localStorage.setItem(KEY, unit);
  } catch {
    // Stockage indisponible : l'unité par défaut reste.
  }
}
