import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/bridge/actions';

const viewStatus = {
  id: 'view_status',
  locationId: 'bridge',
  label: t.viewStatus,

  execute(_engine: VylosActionAPI, state: GameState) {
    state.ui.stationOverviewOpen = true;
  },
} satisfies VylosAction<GameState>;

export default viewStatus;
