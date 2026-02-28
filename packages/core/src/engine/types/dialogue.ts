import type { TextEntry } from './events';

/** Base character — projects extend this into their own Character */
export interface VylosCharacter {
  id: string;
  name: string | TextEntry;
  color?: string;
}
