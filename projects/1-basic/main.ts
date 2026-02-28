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
  type VylosCharacter,
} from '@vylos/core';
import config from './vylos.config';

// Locations
import room from './locations/room/location';
import hallway from './locations/hallway/location';
import outside from './locations/outside/location';

// Events
import intro from './global/events/hello';
import explore from './locations/hallway/events/explore';
import nightFalls from './locations/room/events/night_falls';
import trySleep from './locations/room/events/try_sleep';

// Actions
import wait from './global/actions/wait';
import rest from './locations/room/actions/rest';

const app = createApp(GameShell);
const pinia = createPinia();
app.use(pinia);

const engineState = useEngineStateStore(pinia);
const gameState = useGameStateStore(pinia);

// Location manager with links
const locationManager = new LocationManager();
locationManager.registerAll([room, hallway, outside]);
locationManager.setLinks([
  { from: 'room', to: 'hallway' },
  { from: 'hallway', to: 'room' },
  { from: 'hallway', to: 'outside' },
  { from: 'outside', to: 'hallway' },
]);

// Action manager
const actionManager = new ActionManager();
actionManager.registerAll([wait, rest]);

const callbacks: EventRunnerCallbacks = {
  onSay(text: string, speaker: VylosCharacter | null) {
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
    engineState.setForeground(null);
    engineState.setOverlay(null);
  },
  resolveText(entry: string | TextEntry) {
    return typeof entry === 'string' ? entry : entry['en'] ?? Object.values(entry)[0] ?? '';
  },
  getState() { return gameState.state; },
  setState(s) { gameState.setState(s); },
};

const engine = createEngine({ callbacks, projectId: 'basic' });
app.provide(ENGINE_INJECT_KEY, engine);
app.provide(CONFIG_INJECT_KEY, config);
app.mount('#app');

// Start at Main Menu
engineState.setPhase(EnginePhase.MainMenu);

// When player clicks "New Game", init state and start engine
const stopWatch = watch(() => engineState.phase, (newPhase) => {
  if (newPhase === EnginePhase.Running) {
    stopWatch();
    startGame();
  }
});

function startGame() {
  gameState.state.locationId = 'room';
  gameState.state.gameTime = 12;
  engineState.setLocation('room');

  const bg = locationManager.resolveBackground('room', 12);
  if (bg) engineState.setBackground(bg);

  engine.run([intro, explore, nightFalls, trySleep], () => gameState.state, {
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
