/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'vylos:project' {
  export const config: Record<string, unknown>;
  export const plugin: import('./engine/types/plugin').VylosPlugin | undefined;
}

declare module 'vylos:texts/*' {
  const texts: Record<string, Record<string, string>>;
  export default texts;
}
