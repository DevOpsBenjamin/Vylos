import type { ModuleState } from './index';

export interface MedbayData extends ModuleState {
    // Medbay-specific flags
}

export function createMedbay(): MedbayData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
    };
}
