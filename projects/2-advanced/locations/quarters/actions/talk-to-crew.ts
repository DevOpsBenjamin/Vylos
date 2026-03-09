import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import type { CrewMember } from '@game/gameState/crews';
import t from 'vylos:texts/quarters/actions';

function hasAvailableConversation(member: CrewMember & Record<string, unknown>): boolean {
  if (member.status !== 'idle') return false;
  // Check conversation flags in order
  for (let i = 1; i <= 3; i++) {
    const key = `conversation${i}`;
    if (key in member && member[key] === false) return true;
  }
  return false;
}

function triggerNextConversation(member: CrewMember & Record<string, unknown>): void {
  for (let i = 1; i <= 3; i++) {
    const key = `conversation${i}`;
    if (key in member && member[key] === false) {
      member[key] = true;
      return;
    }
  }
}

const talkToCrew = {
  id: 'talk_to_crew',
  locationId: 'quarters',
  label: t.talkToCrew,

  unlocked(state: GameState) {
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    return members.some((m) => m.location === 'quarters' && hasAvailableConversation(m));
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    for (const m of members) {
      if (m.location === 'quarters' && hasAvailableConversation(m)) {
        triggerNextConversation(m);
      }
    }
  },
} satisfies VylosAction<GameState>;

export default talkToCrew;
