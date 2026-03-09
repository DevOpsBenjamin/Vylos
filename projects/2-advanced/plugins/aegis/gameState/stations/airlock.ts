import type { ModuleState } from './index';

export type AirlockAction = 'none' | 'scavenge' | 'repair_hull' | 'eva';

export interface AirlockData extends ModuleState {
    actionState: AirlockAction;
}

export function createAirlock(): AirlockData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
        actionState: 'none',
    };
}
