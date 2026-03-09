import type { ModuleState } from './index';

export type QuartersAction = 'none' | 'rest' | 'eat' | 'talk';

export interface QuartersData extends ModuleState {
    actionState: QuartersAction;
}

export function createQuarters(): QuartersData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
        actionState: 'none',
    };
}
