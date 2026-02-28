import 'reflect-metadata';
import { createApp, watch } from 'vue';
import { createPinia } from 'pinia';
import GameShell from './components/app/GameShell.vue';
import { createEngine } from './engine/core/EngineFactory';
import { useEngineStateStore } from './stores/engineState';
import { useGameStateStore } from './stores/gameState';
import { ENGINE_INJECT_KEY } from './composables/useEngine';
import { CONFIG_INJECT_KEY } from './composables/useConfig';
import { LocationManager } from './engine/managers/LocationManager';
import { ActionManager } from './engine/managers/ActionManager';
import { LanguageManager } from './engine/managers/LanguageManager';
import { EnginePhase } from './engine/types/engine';
import type { VylosConfig } from './engine/types/config';
import type { VylosPlugin, VylosGameStore } from './engine/types/plugin';
import type { VylosLocation } from './engine/types/locations';
import type { VylosEvent, TextEntry } from './engine/types/events';
import type { VylosAction } from './engine/types/actions';
import type { VylosCharacter } from './engine/types/dialogue';
import type { EventRunnerCallbacks } from './engine/core/EventRunner';
import type { EngineLoopCallbacks } from './engine/core/Engine';

export interface SetupOptions {
  config: VylosConfig;
  plugin?: VylosPlugin;
  locations?: VylosLocation[];
  events?: VylosEvent[];
  actions?: VylosAction[];
  initLinks?: (lm: LocationManager) => void;
  /** When true, skip the MainMenu phase and go directly to Running (triggers startGame). */
  skipMainMenu?: boolean;
}

/**
 * One-call setup function that replaces all main.ts boilerplate.
 * Creates the Vue app, Pinia stores, engine, and wires everything together.
 */
export function setupVylos(options: SetupOptions): void {
  const { config, plugin, locations = [], events = [], actions = [], initLinks, skipMainMenu = false } = options;

  const app = createApp(GameShell);
  const pinia = createPinia();
  app.use(pinia);

  const gameStore: VylosGameStore = plugin?.gameStore
    ? plugin.gameStore(pinia)
    : useGameStateStore(pinia);
  const engineState = useEngineStateStore(pinia);

  const languageManager = config.languages.length > 1
    ? createLanguageManager(config)
    : null;
  const resolveText = buildResolveText(languageManager, config);

  const locationManager = new LocationManager();
  locationManager.registerAll(locations);

  if (locations.length > 0 && !locationManager.has(config.defaultLocation)) {
    console.error(
      `[Vylos] Default location "${config.defaultLocation}" is not registered. ` +
      `Registered locations: [${locationManager.getAll().map(l => l.id).join(', ')}]. ` +
      `Check your vylos.config.ts defaultLocation value.`
    );
  }

  const actionManager = new ActionManager();
  actionManager.registerAll(actions);

  const callbacks = buildCallbacks(engineState, gameStore, locationManager, resolveText);
  const engine = createEngine({ callbacks, projectId: config.id, plugin });

  app.provide(ENGINE_INJECT_KEY, engine);
  app.provide(CONFIG_INJECT_KEY, config);
  app.mount('#app');

  if (initLinks) {
    initLinks(locationManager);
  }

  if (skipMainMenu) {
    engineState.setPhase(EnginePhase.Running);
    startGame();
  } else {
    engineState.setPhase(EnginePhase.MainMenu);

    const stopWatch = watch(() => engineState.phase, (newPhase) => {
      if (newPhase === EnginePhase.Running) {
        stopWatch();
        startGame();
      }
    });
  }

  function startGame(): void {
    const startGameTime = config.startGameTime ?? 12;
    gameStore.setState({
      ...gameStore.getState(),
      locationId: config.defaultLocation,
      gameTime: startGameTime,
    });

    engineState.setLocation(config.defaultLocation);

    const bg = locationManager.resolveBackground(config.defaultLocation, startGameTime);
    if (bg) engineState.setBackground(bg);

    const loopCallbacks: EngineLoopCallbacks = {
      onTick(state) {
        const locs = locationManager.getAccessibleFrom(state.locationId, state);
        engineState.setLocations(locs.map(l => ({
          id: l.id,
          name: resolveText(l.name),
          accessible: true,
        })));

        const acts = actionManager.getAvailable(state.locationId, state);
        engineState.setActions(acts.map(a => ({
          id: a.id,
          label: resolveText(a.label),
          locationId: a.locationId ?? '',
        })));

        engineState.setDrawableEvents(
          engine.eventManager.getDrawableEvents(state, resolveText),
        );

        const bg = locationManager.resolveBackground(state.locationId, state.gameTime);
        if (bg) engineState.setBackground(bg);
      },
      onAction(actionId, state) {
        actionManager.execute(actionId, state);
      },
    };

    engine.run(events, () => gameStore.getState(), loopCallbacks).catch(console.error);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createLanguageManager(config: VylosConfig): LanguageManager {
  const lm = new LanguageManager();
  lm.setLanguage(config.defaultLanguage ?? config.languages[0]);
  return lm;
}

function buildResolveText(
  languageManager: LanguageManager | null,
  config: VylosConfig,
): (entry: string | TextEntry) => string {
  if (languageManager) {
    return (entry) => languageManager.resolve(entry);
  }
  const lang = config.defaultLanguage ?? 'en';
  return (entry) =>
    typeof entry === 'string'
      ? entry
      : entry[lang] ?? Object.values(entry)[0] ?? '';
}

type EngineStateStore = ReturnType<typeof useEngineStateStore>;

function buildCallbacks(
  engineState: EngineStateStore,
  gameStore: VylosGameStore,
  locationManager: LocationManager,
  resolveText: (entry: string | TextEntry) => string,
): EventRunnerCallbacks {
  return {
    onSay(text: string, speaker: VylosCharacter | null) {
      engineState.setDialogue({ text, speaker, isNarration: !speaker });
    },
    onChoice(options) {
      engineState.setChoices({ prompt: null, options });
    },
    onSetBackground(path) {
      engineState.setBackground(path);
    },
    onSetForeground(path) {
      engineState.setForeground(path);
    },
    onShowOverlay(componentId, props) {
      engineState.setOverlay(componentId, props);
    },
    onHideOverlay() {
      engineState.setOverlay(null);
    },
    onSetLocation(locationId) {
      const state = gameStore.getState();
      state.locationId = locationId;
      engineState.setLocation(locationId);
      const bg = locationManager.resolveBackground(locationId, state.gameTime);
      if (bg) engineState.setBackground(bg);
    },
    onClear() {
      engineState.setDialogue(null);
      engineState.setChoices(null);
      engineState.setForeground(null);
      engineState.setOverlay(null);
    },
    resolveText(entry) {
      return resolveText(entry);
    },
    getState() {
      return gameStore.getState();
    },
    setState(newState) {
      gameStore.setState(newState);
    },
  };
}
