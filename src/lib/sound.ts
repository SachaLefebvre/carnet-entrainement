// Signaux du mode guidé : bip, vibration, et écran maintenu allumé.

let context: AudioContext | null = null;

export function beep(frequency = 880, ms = 130) {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.18, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + ms / 1000);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + ms / 1000);
  } catch {
    // Pas de son disponible : la vibration et l'écran suffisent.
  }
}

export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Vibration non prise en charge.
  }
}

/** Empêche l'écran de s'éteindre pendant une séance. Renvoie la fonction qui relâche le verrou. */
export function keepAwake(): () => void {
  let lock: WakeLockSentinel | null = null;
  let released = false;
  const acquire = async () => {
    try {
      if (!released && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen');
    } catch {
      // Non pris en charge ou refusé : la séance continue, l'écran pourra se mettre en veille.
    }
  };
  void acquire();
  // Le verrou tombe quand l'app passe en arrière-plan : on le reprend au retour.
  document.addEventListener('visibilitychange', acquire);
  return () => {
    released = true;
    document.removeEventListener('visibilitychange', acquire);
    void lock?.release();
  };
}
