export interface PlayerState {
  energy: number;
  charm: number;
  day: number;
}

export function createPlayerState(): PlayerState {
  return {
    energy: 100,
    charm: 20,
    day: 1,
  };
}
