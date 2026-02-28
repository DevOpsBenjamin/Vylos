import type { TextEntry } from './events';

/** Character definition for speaker resolution */
export interface Character {
  id: string;
  name: string | TextEntry;
  color?: string;
  [key: string]: unknown;
}
