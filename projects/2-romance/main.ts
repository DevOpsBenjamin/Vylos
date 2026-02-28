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
  LanguageManager,
  type EventRunnerCallbacks,
  type VylosGameState,
  type TextEntry,
  type VylosCharacter,
} from '@vylos/core';
import config from './vylos.config';

// Locations
import apartment from './locations/apartment/location';
import hallway from './locations/hallway/location';
import cafe from './locations/cafe/location';
import park from './locations/park/location';
import neighbor from './locations/neighbor/location';

// Global events
import intro from './global/events/intro';
import actionFeedback from './global/events/action_feedback';

// Apartment events
import morningRoutine from './locations/apartment/events/morning_routine';
import findLetter from './locations/apartment/events/find_letter';

// Hallway events
import meetLena from './locations/hallway/events/meet_lena';
import lenaInvite from './locations/hallway/events/lena_invite';

// Cafe events
import firstVisit from './locations/cafe/events/first_visit';
import mayaPoem from './locations/cafe/events/maya_poem';
import mayaDate from './locations/cafe/events/maya_date';

// Park events
import parkWalk from './locations/park/events/park_walk';
import mayaParkDate from './locations/park/events/maya_park_date';

// Neighbor events
import dinnerAtLena from './locations/neighbor/events/dinner_at_lena';
import lenaPainting from './locations/neighbor/events/lena_painting';

// Actions
import rest from './locations/apartment/actions/rest';
import groom from './locations/apartment/actions/groom';
import orderCoffee from './locations/cafe/actions/order_coffee';
import chatMaya from './locations/cafe/actions/chat_maya';

// Vue + Pinia setup
const app = createApp(GameShell);
const pinia = createPinia();
app.use(pinia);

const engineState = useEngineStateStore(pinia);
const gameState = useGameStateStore(pinia);

// Language manager
const languageManager = new LanguageManager();
languageManager.setLanguage(config.defaultLanguage);

// Location manager with links
const locationManager = new LocationManager();
locationManager.registerAll([apartment, hallway, cafe, park, neighbor]);
locationManager.setLinks([
  { from: 'apartment', to: 'hallway' },
  { from: 'hallway', to: 'apartment' },
  { from: 'hallway', to: 'cafe' },
  { from: 'cafe', to: 'hallway' },
  { from: 'hallway', to: 'park' },
  { from: 'park', to: 'hallway' },
  { from: 'hallway', to: 'neighbor', condition: (s: VylosGameState) => s.flags['knows_lena'] === true },
  { from: 'neighbor', to: 'hallway' },
]);

// Action manager
const actionManager = new ActionManager();
actionManager.registerAll([rest, groom, orderCoffee, chatMaya]);

// Engine callbacks bridging engine ↔ UI stores
const callbacks: EventRunnerCallbacks = {
  onSay(text: string, speaker: VylosCharacter | null) {
    engineState.setDialogue({ text, speaker, isNarration: speaker === null });
  },
  onChoice(options) {
    engineState.setChoices({ prompt: null, options });
  },
  onSetBackground(path: string) {
    engineState.setBackground(path);
  },
  onSetForeground(path: string | null) {
    engineState.setForeground(path);
  },
  onShowOverlay() {},
  onHideOverlay() {},
  onSetLocation(locationId: string) {
    gameState.state.locationId = locationId;
    engineState.setLocation(locationId);
    const bg = locationManager.resolveBackground(locationId, gameState.state.gameTime);
    if (bg) engineState.setBackground(bg);
  },
  onClear() {
    engineState.setDialogue(null);
    engineState.setChoices(null);
  },
  resolveText(entry: string | TextEntry): string {
    return languageManager.resolve(entry);
  },
  getState(): VylosGameState {
    return gameState.state;
  },
  setState(newState: VylosGameState) {
    gameState.setState(newState);
  },
};

const engine = createEngine({ callbacks, projectId: 'romance' });
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

async function startGame() {
  gameState.state.locationId = config.defaultLocation;
  gameState.state.gameTime = 8;

  // Initialize extended state fields
  const s = gameState.state as any;
  s.energy = s.energy ?? 100;
  s.charm = s.charm ?? 20;
  s.day = s.day ?? 1;
  s.npcs = s.npcs ?? { maya: { affection: 0, met: false, dates: 0, events: [] }, lena: { affection: 0, met: false, dates: 0, events: [] } };
  s.inventory = s.inventory ?? [];

  engineState.setLocation(config.defaultLocation);

  const events = [
    intro,
    actionFeedback,
    morningRoutine,
    findLetter,
    meetLena,
    lenaInvite,
    firstVisit,
    mayaPoem,
    mayaDate,
    parkWalk,
    mayaParkDate,
    dinnerAtLena,
    lenaPainting,
  ];

  await engine.run(events, () => gameState.state, {
    onTick(state) {
      const locations = locationManager.getAccessibleFrom(state.locationId, state);
      engineState.setLocations(locations.map(l => ({
        id: l.id,
        name: languageManager.resolve(l.name),
        accessible: true,
      })));

      const actions = actionManager.getAvailable(state.locationId, state);
      engineState.setActions(actions.map(a => ({
        id: a.id,
        label: languageManager.resolve(a.label),
        locationId: a.locationId ?? '',
      })));

      const resolveText = (t: string | Record<string, string>) => languageManager.resolve(t);
      engineState.setDrawableEvents(engine.eventManager.getDrawableEvents(state, resolveText));

      const bg = locationManager.resolveBackground(state.locationId, state.gameTime);
      if (bg) engineState.setBackground(bg);
    },
    onAction(actionId, state) {
      actionManager.execute(actionId, state);
    },
  });
}
