/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'virtual:vylos-project' {
  import type { VylosLocation, VylosEvent, VylosAction, LocationManager } from '@vylos/core';
  export const locations: VylosLocation[];
  export const events: VylosEvent[];
  export const actions: VylosAction[];
  export const initLinks: ((lm: LocationManager) => void) | undefined;
}
