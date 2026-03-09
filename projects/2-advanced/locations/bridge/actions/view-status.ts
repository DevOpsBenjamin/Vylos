import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.bridge.actions;

const viewStatus: Action = {
  id: 'view_status',
  locationId: 'bridge',
  label: t.viewStatus,

  execute(_engine, state) {
    state.ui.stationOverviewOpen = true;
  },
};

export default viewStatus;
