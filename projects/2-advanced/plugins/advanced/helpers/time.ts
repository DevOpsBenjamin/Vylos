export type TimePeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export function getTimePeriod(gameTime: number): TimePeriod {
  const h = gameTime % 24;
  if (h >= 6 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Night';
}

export function formatTime(gameTime: number): string {
  const t = gameTime % 24;
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
