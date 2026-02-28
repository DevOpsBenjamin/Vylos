import type { InjectionKey } from 'vue';
import type { VylosConfig } from '../engine/types';

export const CONFIG_INJECT_KEY: InjectionKey<VylosConfig> = Symbol.for('vylos-config');
