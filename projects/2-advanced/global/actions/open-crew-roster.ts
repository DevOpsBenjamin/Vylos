import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import texts from 'vylos:texts';
const t = texts.global.actions;

const openCrewRoster = {
  id: 'open_crew_roster',
  label: t.openCrewRoster,

  execute(_engine: VylosActionAPI, state: GameState) {
    state.ui.crewRosterOpen = true;
  },
} satisfies VylosAction<GameState>;

export default openCrewRoster;
