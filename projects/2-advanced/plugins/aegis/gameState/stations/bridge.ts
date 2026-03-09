import type { ModuleState } from './index';

export interface BridgeData extends ModuleState {
    // Bridge-specific flags
}

export function createBridge(): BridgeData {
    return {
        integrity: 100,
        powered: true,
        damaged: false,
    };
}
