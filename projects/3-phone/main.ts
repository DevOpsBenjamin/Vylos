import 'reflect-metadata';
import './style.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  createEngine,
  useEngineStateStore,
  useGameStateStore,
  ENGINE_INJECT_KEY,
  CONFIG_INJECT_KEY,
  EnginePhase,
  LocationManager,
  type EventRunnerCallbacks,
  type BaseGameState,
  type TextEntry,
} from '@vylos/core';

// Use PhoneShell as root component (plugin override)
import PhoneShell from './components/ui/PhoneShell.vue';
import plugin from './setup';
import config from './vylos.config';

// Locations (phone screens)
import homescreen from './locations/homescreen/location';
import messages from './locations/messages/location';
import gallery from './locations/gallery/location';
import settings from './locations/settings/location';

// Events
import boot from './global/events/boot';
import firstNotification from './locations/homescreen/events/first_notification';
import unknownChat from './locations/messages/events/unknown_chat';
import hiddenPhoto from './locations/gallery/events/hidden_photo';

// Create app with PhoneShell as root
const app = createApp(PhoneShell);
const pinia = createPinia();
app.use(pinia);

const engineState = useEngineStateStore(pinia);
const gameState = useGameStateStore(pinia);

// Location manager — phone screens
const locationManager = new LocationManager();
locationManager.registerAll([homescreen, messages, gallery, settings]);
locationManager.setLinks([
  { from: 'homescreen', to: 'messages' },
  { from: 'homescreen', to: 'gallery' },
  { from: 'homescreen', to: 'settings' },
  { from: 'messages', to: 'homescreen' },
  { from: 'gallery', to: 'homescreen' },
  { from: 'settings', to: 'homescreen' },
]);

// EventRunner callbacks
const callbacks: EventRunnerCallbacks = {
  onSay(text, speaker) {
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

// Create engine with plugin
const engine = createEngine({ callbacks, plugin, projectId: 'phone' });
app.provide(ENGINE_INJECT_KEY, engine);
app.provide(CONFIG_INJECT_KEY, config);
app.mount('#app');

// Initialize phone state
gameState.state.locationId = config.defaultLocation;
gameState.state.gameTime = 22.5; // Late at night — you found the phone
engineState.setPhase(EnginePhase.Running);
engineState.setLocation(config.defaultLocation);

// All events
const events = [boot, firstNotification, unknownChat, hiddenPhoto];

engine.run(events, () => gameState.state).catch(console.error);
