/**
 * Typed flags for event gating.
 * Using a typed interface instead of Record<string, boolean> gives you
 * autocomplete and compile-time safety on every flag check.
 */
export interface Flags {
    introDone: boolean;
    seenKey: boolean;
    pickedUpKey: boolean;
    doorUnlocked: boolean;
}

export function createFlags(): Flags {
    return {
        introDone: false,
        seenKey: false,
        pickedUpKey: false,
        doorUnlocked: false,
    };
}
