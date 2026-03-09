import type { ModuleState } from './index';

export type MedbayAction = 'none' | 'heal' | 'craft' | 'counsel';

export interface MedbayData extends ModuleState {
    actionState: MedbayAction;
}

export function createMedbay(): MedbayData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
        actionState: 'none',
    };
}
