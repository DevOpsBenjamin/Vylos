import type { VylosCharacter } from '@vylos/core';

/** Extend VylosCharacter with your project-specific fields */
export interface Character extends VylosCharacter {
  // portrait?: string;
  // role?: string;
}

export const narrator: Character = { id: 'narrator', name: 'Narrator' };
