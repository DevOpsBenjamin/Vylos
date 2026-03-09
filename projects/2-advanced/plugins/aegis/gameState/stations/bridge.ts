import type { ModuleState } from './index';

export type BridgeAction = 'none' | 'send_distress';

export interface BridgeData extends ModuleState {
    actionState: BridgeAction;
}

export function createBridge(): BridgeData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
        actionState: 'none',
    };
}
