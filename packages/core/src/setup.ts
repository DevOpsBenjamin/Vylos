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
import { setGlobalLanguage } from './composables/useLanguage';
import { EnginePhase } from './engine/types/engine';
import { attachDevConsole } from './engine/utils/devConsole';
import type { VylosConfig } from './engine/types/config';
import type { VylosPlugin, VylosGameStore } from './engine/types/plugin';
import type { VylosLocation } from './engine/types/locations';
import type { VylosEvent, TextEntry } from './engine/types/events';
import type { VylosAction } from './engine/types/actions';
import type { VylosActionAPI } from './engine/types/events';
import type { VylosCharacter } from './engine/types/dialogue';
import type { VylosGameState } from './engine/types/game-state';
import type { EventRunnerCallbacks } from './engine/core/EventRunner';
import type { EngineLoopCallbacks } from './engine/core/Engine';

export interface SetupOptions<TState extends VylosGameState = VylosGameState> {
  config: VylosConfig;
  plugin?: VylosPlugin;
  locations?: VylosLocation<TState>[];
  events?: VylosEvent<TState>[];
  actions?: VylosAction<TState>[];
  initLinks?: (lm: LocationManager<TState>) => void;
  /** When true, skip the MainMenu phase and go directly to Running (triggers startGame). */
  skipMainMenu?: boolean;
  /** Called when New Game resets state — use to reinitialize custom game store fields. */
  onNewGame?: () => void;
}

/**
 * One-call setup function that replaces all main.ts boilerplate.
 * Creates the Vue app, Pinia stores, engine, and wires everything together.
 */
export function setupVylos<TState extends VylosGameState = VylosGameState>(options: SetupOptions<TState>): void {
  const { config, plugin, locations = [], events = [], actions = [], initLinks, skipMainMenu = false } = options;

  document.title = config.name;

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
  const normalizeText = buildNormalizeText(config);

  const locationManager = new LocationManager<TState>();
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

  const callbacks = buildCallbacks(engineState, gameStore, locationManager, normalizeText);
  const onLanguageChange = (lang: string) => {
    languageManager?.setLanguage(lang);
    setGlobalLanguage(lang);
  };
  const engine = createEngine({ callbacks, projectId: config.id, plugin, onLanguageChange });
  attachDevConsole(engine, () => gameStore.getState(), config);

  app.provide(ENGINE_INJECT_KEY, engine);
  app.provide(CONFIG_INJECT_KEY, config);
  app.mount('#app');

  initLinks?.(locationManager);

  // -- Loop callbacks (shared by all engine.run starts) ----------------------
  const loopCallbacks: EngineLoopCallbacks = {
    onTick(state) {
      engineState.setLocation(state.locationId);

      const locs = locationManager.getAccessibleFrom(state.locationId, state as TState);
      engineState.setLocations(locs.map(l => ({
        id: l.id,
        name: normalizeText(l.name),
        accessible: true,
      })));

      const acts = actionManager.getAvailable(state.locationId, state);
      engineState.setActions(acts.map(a => ({
        id: a.id,
        label: normalizeText(a.label),
        locationId: a.locationId ?? '',
      })));

      engineState.setDrawableEvents(
        engine.eventManager.getDrawableEvents(state, normalizeText),
      );

      const bg = locationManager.resolveBackground(state.locationId, state.gameTime);
      if (bg) engineState.setBackground(bg);
    },
    onAction(actionId, state) {
      const actionAPI: VylosActionAPI = {
        jump: (eventId: string) => engine.eventRunner.jump(eventId),
        get inventory() { return engine.eventRunner.inventory; },
      };
      actionManager.execute(actionId, state, actionAPI);
    },
  };

  // -- Helpers ---------------------------------------------------------------
  let engineStarted = false;

  function initializeGameState(): void {
    const startGameTime = config.startGameTime ?? 12;
    gameStore.setState({
      ...gameStore.getState(),
      locationId: config.defaultLocation,
      gameTime: startGameTime,
    });

    engineState.setLocation(config.defaultLocation);

    const bg = locationManager.resolveBackground(config.defaultLocation, startGameTime);
    if (bg) engineState.setBackground(bg);
  }

  function ensureEngineRunning(): void {
    if (engineStarted) return;
    engineStarted = true;
    engine.run(events, () => gameStore.getState(), loopCallbacks).catch(console.error);
  }

  // -- Wire onNewGame callback -----------------------------------------------
  engine.onNewGame = () => {
    gameStore.$reset();
    initializeGameState();
    options.onNewGame?.();
  };

  // -- Boot ------------------------------------------------------------------
  if (skipMainMenu) {
    initializeGameState();
    engineState.setPhase(EnginePhase.Running);
    ensureEngineRunning();
  } else {
    engineState.setPhase(EnginePhase.MainMenu);

    // Persistent watcher — starts engine on first Running transition
    watch(() => engineState.phase, (newPhase) => {
      if (newPhase === EnginePhase.Running) {
        ensureEngineRunning();
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createLanguageManager(config: VylosConfig): LanguageManager {
  const lm = new LanguageManager();
  const lang = config.defaultLanguage ?? config.languages[0].code;
  lm.setLanguage(lang);
  setGlobalLanguage(lang);
  return lm;
}

function buildNormalizeText(
  config: VylosConfig,
): (entry: string | TextEntry) => TextEntry {
  const defaultLang = config.defaultLanguage ?? 'en';
  return (entry) =>
    typeof entry === 'string' ? { [defaultLang]: entry } : entry;
}

type EngineStateStore = ReturnType<typeof useEngineStateStore>;

function buildCallbacks(
  engineState: EngineStateStore,
  gameStore: VylosGameStore,
  locationManager: LocationManager,
  normalizeText: (entry: string | TextEntry) => TextEntry,
): EventRunnerCallbacks {
  return {
    onSay(text, speaker, variables) {
      engineState.setDialogue({ text, speaker, isNarration: !speaker, variables });
    },
    onChoice(options) {
      engineState.setChoices({ prompt: null, options });
    },
    onSetBackground(path) {
      engineState.setBackground(path);
    },
    onSetForeground(layers) {
      engineState.setForeground(layers);
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
    },
    normalizeText,
    getState() {
      return gameStore.getState();
    },
    setState(newState) {
      gameStore.setState(newState);
    },
  };
}
