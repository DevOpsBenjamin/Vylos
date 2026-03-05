import type { VylosCharacter } from '@vylos/core';
import { type MayaCharacter, createMaya } from './maya';
import { type LenaCharacter, createLena } from './lena';

export interface Character extends VylosCharacter {}

export interface Characters {
  maya: MayaCharacter;
  lena: LenaCharacter;
}

export function createCharacters(): Characters {
  return { maya: createMaya(), lena: createLena() };
}
