import { type BridgeData, createBridge } from './bridge';
import { type ReactorData, createReactor } from './reactor';
import { type MedbayData, createMedbay } from './medbay';
import { type AirlockData, createAirlock } from './airlock';
import { type QuartersData, createQuarters } from './quarters';

export type ModuleId = 'bridge' | 'reactor' | 'medbay' | 'airlock' | 'quarters';

// Common module interface
export interface ModuleState {
    integrity: number;
    powered: boolean;
    damaged: boolean;
}

export interface StationState {
    oxygen: number;
    energy: number;
    materials: number;
    modules: Modules;
}

export interface Modules {
    bridge: BridgeData;
    reactor: ReactorData;
    medbay: MedbayData;
    airlock: AirlockData;
    quarters: QuartersData;
}

export function createModules(): Modules {
    return {
        bridge: createBridge(),
        reactor: createReactor(),
        medbay: createMedbay(),
        airlock: createAirlock(),
        quarters: createQuarters(),
    };
}

export function createStation(): StationState {
    return {
        oxygen: 100,
        energy: 100,
        materials: 30,
        modules: createModules(),
    };
}
