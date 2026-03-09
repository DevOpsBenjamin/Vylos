import type { VylosCharacter } from '@vylos/core';

import type { ModuleId } from '../stations';

export type CrewStatus = 'idle' | 'working' | 'injured' | 'stressed_out';

import { type ElenaData, createElena } from './elena';
import { type JaxData, createJax } from './jax';
import { type KaelData, createKael } from './kael';

//Common Crew interface
export interface CrewMember extends VylosCharacter {
    name: string;
    role: 'engineer' | 'medic' | 'scout';
    status: CrewStatus;
    location: ModuleId;
    stress: number;
    affinity: number;
    portrait: string;
}

export interface Crews {
    elena: ElenaData;
    jax: JaxData;
    kael: KaelData;
}

export function createCrews(): Crews {
    return {
        elena: createElena(),
        jax: createJax(),
        kael: createKael(),
    }
}
