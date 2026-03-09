import type { CrewMember } from "./index";

export interface ElenaData extends CrewMember {
    conversation1: boolean;
    conversation2: boolean;
    //If we need custom flags
}

export function createElena(): ElenaData {
    return {
        id: 'elena',
        name: 'Elena',
        role: 'medic',
        status: 'idle',
        location: 'medbay',
        stress: 5,
        affinity: 50,
        portrait: 'elena.webp',
        conversation1: false,
        conversation2: false,
    }
};

