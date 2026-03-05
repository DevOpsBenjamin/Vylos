export interface Flags {
  introDone: boolean;
  wokeUp: boolean;
  foundLetter: boolean;
  freshenedUp: boolean;
  rested: boolean;
  visitedCafe: boolean;
  orderedCoffee: boolean;
  chattedMaya: boolean;
  parkIntro: boolean;
}

export function createFlags(): Flags {
  return {
    introDone: false,
    wokeUp: false,
    foundLetter: false,
    freshenedUp: false,
    rested: false,
    visitedCafe: false,
    orderedCoffee: false,
    chattedMaya: false,
    parkIntro: false,
  };
}
