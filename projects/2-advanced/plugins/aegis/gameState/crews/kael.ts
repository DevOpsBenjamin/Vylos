import type { CrewMember } from "./index";

export interface KaelData extends CrewMember {
    //If we need custom flags
    conversation1: boolean;
}

export function createKael(): KaelData {
    return {
        id: 'kael',
        name: 'Kael',
        role: 'scout',
        status: 'idle',
        location: 'airlock',
        stress: 20,
        affinity: 30,
        portrait: 'assets/characters/kael/portrait.png',
        fullBody: 'assets/characters/kael/full.png',
        conversation1: false,
    }
};