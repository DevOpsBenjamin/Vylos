import type { BackgroundEntry } from '../types';

/** Resolve the correct background for a given game time */
export function resolveBackground(backgrounds: BackgroundEntry[], gameTime: number): string | null {
  if (backgrounds.length === 0) return null;

  // Find time-specific background first
  for (const bg of backgrounds) {
    if (bg.timeRange) {
      const [start, end] = bg.timeRange;
      const hour = gameTime % 24;
      if (start <= end) {
        // Normal range (e.g., 6-18)
        if (hour >= start && hour < end) return bg.path;
      } else {
        // Wrapping range (e.g., 22-6)
        if (hour >= start || hour < end) return bg.path;
      }
    }
  }

  // Fall back to first entry without time range, or first entry overall
  const defaultBg = backgrounds.find(bg => !bg.timeRange) ?? backgrounds[0];
  return defaultBg.path;
}

/** Format game time as HH:MM string */
export function formatGameTime(gameTime: number): string {
  const hours = Math.floor(gameTime % 24);
  const minutes = Math.floor((gameTime % 1) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/** Interpolate variables in text: "Hello {name}!" → "Hello Alice!" */
export function interpolate(text: string, variables: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    return key in variables ? String(variables[key]) : match;
  });
}
