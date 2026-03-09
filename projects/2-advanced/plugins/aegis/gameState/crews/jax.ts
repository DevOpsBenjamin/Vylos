import type { CrewMember } from "./index";

export interface JaxData extends CrewMember {
    //If we need custom flags
    conversation1: boolean;
    conversation2: boolean;
    conversation3: boolean;
}

export function createJax(): JaxData {
    return {
        id: 'jax',
        name: 'Jax',
        role: 'engineer',
        status: 'idle',
        location: 'bridge',
        stress: 10,
        affinity: 40,
        portrait: 'jax.webp',
        conversation1: false,
        conversation2: false,
        conversation3: false,
    }
};
