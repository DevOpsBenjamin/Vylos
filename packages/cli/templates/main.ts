import 'reflect-metadata';
import './style.css';
import { createApp, watch } from 'vue';
import { createPinia } from 'pinia';
import {
  GameShell,
  createEngine,
  useEngineStateStore,
  useGameStateStore,
  ENGINE_INJECT_KEY,
  CONFIG_INJECT_KEY,
  EnginePhase,
  LocationManager,
  ActionManager,
  type EventRunnerCallbacks,
  type TextEntry,
  type Character,
} from '@vylos/core';
import config from './vylos.config';

// Locations
import home from './locations/home/location';

// Events
import intro from './global/events/intro';

// Actions
import wait from './global/actions/wait';

const app = createApp(GameShell);
const pinia = createPinia();
app.use(pinia);

const engineState = useEngineStateStore(pinia);
const gameState = useGameStateStore(pinia);

// Location manager
const locationManager = new LocationManager();
locationManager.registerAll([home]);

// Action manager
const actionManager = new ActionManager();
actionManager.registerAll([wait]);

const callbacks: EventRunnerCallbacks = {
  onSay(text: string, speaker: Character | null) {
    engineState.setDialogue({ text, speaker, isNarration: !speaker });
  },
  onChoice(options) {
    engineState.setChoices({ prompt: null, options });
  },
  onSetBackground(path) { engineState.setBackground(path); },
  onSetForeground(path) { engineState.setForeground(path); },
  onShowOverlay() {},
  onHideOverlay() {},
  onSetLocation(id) {
    gameState.state.locationId = id;
    engineState.setLocation(id);
    const bg = locationManager.resolveBackground(id, gameState.state.gameTime);
    if (bg) engineState.setBackground(bg);
  },
  onClear() {
    engineState.setDialogue(null);
    engineState.setChoices(null);
  },
  resolveText(entry: string | TextEntry) {
    return typeof entry === 'string' ? entry : entry['en'] ?? Object.values(entry)[0] ?? '';
  },
  getState() { return gameState.state; },
  setState(s) { gameState.setState(s); },
};

const engine = createEngine({ callbacks, projectId: config.id });
app.provide(ENGINE_INJECT_KEY, engine);
app.provide(CONFIG_INJECT_KEY, config);
app.mount('#app');

engineState.setPhase(EnginePhase.MainMenu);

const stopWatch = watch(() => engineState.phase, (newPhase) => {
  if (newPhase === EnginePhase.Running) {
    stopWatch();
    startGame();
  }
});

function startGame() {
  gameState.state.locationId = 'home';
  gameState.state.gameTime = 12;
  engineState.setLocation('home');

  engine.run([intro], () => gameState.state, {
    onTick(state) {
      const locations = locationManager.getAccessibleFrom(state.locationId, state);
      engineState.setLocations(locations.map(l => ({
        id: l.id,
        name: typeof l.name === 'string' ? l.name : l.name['en'] ?? l.id,
        accessible: true,
      })));

      const actions = actionManager.getAvailable(state.locationId, state);
      engineState.setActions(actions.map(a => ({
        id: a.id,
        label: typeof a.label === 'string' ? a.label : a.label['en'] ?? a.id,
        locationId: a.locationId ?? '',
      })));

      const resolveText = (t: string | Record<string, string>) =>
        typeof t === 'string' ? t : t['en'] ?? Object.values(t)[0] ?? '';
      engineState.setDrawableEvents(engine.eventManager.getDrawableEvents(state, resolveText));

      const bg = locationManager.resolveBackground(state.locationId, state.gameTime);
      if (bg) engineState.setBackground(bg);
    },
    onAction(actionId, state) {
      actionManager.execute(actionId, state);
    },
  }).catch(console.error);
}
