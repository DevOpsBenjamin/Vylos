import type { TextEntry } from './events';

/** Resolved dialogue line ready for display */
export interface DialogueLine {
  text: string;
  speaker: string | null;
  isNarration: boolean;
}

/** Character definition for speaker resolution */
export interface Character {
  id: string;
  name: string | TextEntry;
  color?: string;
}
