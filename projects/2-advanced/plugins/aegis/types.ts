import type { VylosAction, VylosEvent } from '@vylos/core';
import type { GameState } from './gameState';

export type Action = VylosAction<GameState>;
export type Event = VylosEvent<GameState>;
