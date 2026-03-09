import type { ModuleState } from './index';

export interface AirlockData extends ModuleState {
    // Airlock-specific flags
}

export function createAirlock(): AirlockData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
    };
}
