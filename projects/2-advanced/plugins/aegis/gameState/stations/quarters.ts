import type { ModuleState } from './index';

export interface QuartersData extends ModuleState {
    // Quarters-specific flags
}

export function createQuarters(): QuartersData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
    };
}
