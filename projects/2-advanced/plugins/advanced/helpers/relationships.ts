import type { AdvancedGameState } from '../gameDatas/gameState';

type NpcId = 'maya' | 'lena';

export function getAffection(state: AdvancedGameState, npc: NpcId): number {
  return state.npcs[npc].affection;
}

export function modAffection(state: AdvancedGameState, npc: NpcId, delta: number): void {
  state.npcs[npc].affection = Math.max(0, Math.min(100, state.npcs[npc].affection + delta));
}

export function isNpcMet(state: AdvancedGameState, npc: NpcId): boolean {
  return state.npcs[npc].met;
}

export function setNpcMet(state: AdvancedGameState, npc: NpcId): void {
  state.npcs[npc].met = true;
}

export function addDate(state: AdvancedGameState, npc: NpcId): void {
  state.npcs[npc].dates += 1;
}
