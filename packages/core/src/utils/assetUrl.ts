export function assetUrl(path: string): string {
  const base = (import.meta as any).env?.BASE_URL ?? '/';
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}
