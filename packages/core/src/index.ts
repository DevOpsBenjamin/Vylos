// Types
export * from './engine/types';

// Errors
export { JumpSignal } from './engine/errors/JumpSignal';
export { EventEndError } from './engine/errors/EventEndError';
export { InterruptSignal } from './engine/errors/InterruptSignal';

// Utils
export { logger, LogLevel } from './engine/utils/logger';
export { resolveBackground, formatGameTime, interpolate } from './engine/utils/TimeHelper';
export { deepMerge } from './engine/utils/deepMerge';
export { attachDevConsole } from './engine/utils/devConsole';
export type { VylosConsole } from './engine/utils/devConsole';
export { assetUrl } from './utils/assetUrl';

// Stores
export { useEngineStateStore } from './stores/engineState';
export { useGameStateStore } from './stores/gameState';

// Setup
export { setupVylos } from './setup';
export type { SetupOptions } from './setup';

// Core engine
export { Engine } from './engine/core/Engine';
export type { EngineLoopCallbacks } from './engine/core/Engine';
export { EventRunner } from './engine/core/EventRunner';
export type { EventRunnerCallbacks, HistoryStep } from './engine/core/EventRunner';
export type { InventoryAPI, VylosActionAPI, VylosEventAPI } from './engine/types/events';
export { CheckpointManager } from './engine/core/CheckpointManager';
export { createEngine, getComponentOverride, clearComponentOverrides } from './engine/core/EngineFactory';

// Managers
export { InventoryManager } from './engine/managers/InventoryManager';
export { EventManager } from './engine/managers/EventManager';
export { HistoryManager } from './engine/managers/HistoryManager';
export { NavigationManager, NavigationAction } from './engine/managers/NavigationManager';
export { WaitManager } from './engine/managers/WaitManager';
export { LocationManager } from './engine/managers/LocationManager';
export { ActionManager } from './engine/managers/ActionManager';
export { SaveManager } from './engine/managers/SaveManager';
export { SettingsManager } from './engine/managers/SettingsManager';
export { LanguageManager } from './engine/managers/LanguageManager';
export { InputManager } from './engine/managers/InputManager';

// Storage
export { VylosStorage } from './engine/storage/VylosStorage';

// Composables
export { useEngine, ENGINE_INJECT_KEY } from './composables/useEngine';
export { useGameState } from './composables/useGameState';
export { useLanguage } from './composables/useLanguage';
export { CONFIG_INJECT_KEY } from './composables/useConfig';

// Components — app
export { default as GameShell } from './components/app/GameShell.vue';
export { default as EngineView } from './components/app/EngineView.vue';
export { default as LoadingScreen } from './components/app/LoadingScreen.vue';
export { default as MainMenu } from './components/app/MainMenu.vue';

// Components — core
export { default as BackgroundLayer } from './components/core/BackgroundLayer.vue';
export { default as ForegroundLayer } from './components/core/ForegroundLayer.vue';
export { default as DialogueBox } from './components/core/DialogueBox.vue';
export { default as ChoicePanel } from './components/core/ChoicePanel.vue';
export { default as DrawableOverlay } from './components/core/DrawableOverlay.vue';

// Components — menu
export { default as ActionOverlay } from './components/menu/ActionOverlay.vue';
export { default as LocationOverlay } from './components/menu/LocationOverlay.vue';
export { default as TopBar } from './components/menu/TopBar.vue';
export { default as SaveLoadMenu } from './components/menu/SaveLoadMenu.vue';
export { default as SettingsMenu } from './components/menu/SettingsMenu.vue';
