export interface NpcState {
  affection: number;
  met: boolean;
  dates: number;
  events: string[];
}

export interface RelationshipState {
  npcs: { maya: NpcState; lena: NpcState };
}

export function createRelationshipState(): RelationshipState {
  return {
    npcs: {
      maya: { affection: 0, met: false, dates: 0, events: [] },
      lena: { affection: 0, met: false, dates: 0, events: [] },
    },
  };
}
