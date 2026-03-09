import type { ModuleState } from './index';

export type ReactorAction = 'none' | 'repair' | 'reroute' | 'boost';

export interface ReactorData extends ModuleState {
    actionState: ReactorAction;
}

export function createReactor(): ReactorData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
        actionState: 'none',
    };
}
