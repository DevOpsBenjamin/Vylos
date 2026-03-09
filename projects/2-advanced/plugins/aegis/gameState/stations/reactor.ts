import type { ModuleState } from './index';

export interface ReactorData extends ModuleState {
    // Reactor-specific flags
}

export function createReactor(): ReactorData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
    };
}
