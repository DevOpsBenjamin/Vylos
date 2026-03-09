import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.global.actions;

const openCrewRoster: Action = {
  id: 'open_crew_roster',
  label: t.openCrewRoster,

  execute(_engine, state) {
    state.ui.crewRosterOpen = true;
  },
};

export default openCrewRoster;
