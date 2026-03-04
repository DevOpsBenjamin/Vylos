import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  EnginePhase,
  MenuType,
  type DialogueState,
  type ChoiceState,
  type ActionEntry,
  type LocationEntry,
  type DrawableEventEntry,
  type ForegroundLayer,
} from '../engine/types';

export const useEngineStateStore = defineStore('engineState', () => {
  const phase = ref<EnginePhase>(EnginePhase.Created);
  const background = ref<string | null>(null);
  const foreground = ref<ForegroundLayer[] | null>(null);
  const dialogue = ref<DialogueState | null>(null);
  const choices = ref<ChoiceState | null>(null);
  const currentLocationId = ref<string | null>(null);
  const availableActions = ref<ActionEntry[]>([]);
  const availableLocations = ref<LocationEntry[]>([]);
  const menuOpen = ref<MenuType | null>(null);
  const skipMode = ref(false);
  const autoMode = ref(false);
  const historyBrowsing = ref(false);
  const uiHidden = ref(false);
  const drawableEvents = ref<DrawableEventEntry[]>([]);

  function setDialogue(state: DialogueState | null) {
    dialogue.value = state;
  }

  function setChoices(state: ChoiceState | null) {
    choices.value = state;
  }

  function setBackground(path: string | null) {
    background.value = path;
  }

  function setForeground(layers: ForegroundLayer[] | null) {
    foreground.value = layers;
  }

  function setPhase(p: EnginePhase) {
    phase.value = p;
  }

  function setLocation(id: string | null) {
    currentLocationId.value = id;
  }

  function setActions(actions: ActionEntry[]) {
    availableActions.value = actions;
  }

  function setLocations(locations: LocationEntry[]) {
    availableLocations.value = locations;
  }

  function openMenu(type: MenuType) {
    menuOpen.value = type;
  }

  function closeMenu() {
    menuOpen.value = null;
  }

  function setDrawableEvents(events: DrawableEventEntry[]) {
    drawableEvents.value = events;
  }

  function $reset() {
    phase.value = EnginePhase.Created;
    background.value = null;
    foreground.value = null;
    dialogue.value = null;
    choices.value = null;
    currentLocationId.value = null;
    availableActions.value = [];
    availableLocations.value = [];
    menuOpen.value = null;
    skipMode.value = false;
    autoMode.value = false;
    historyBrowsing.value = false;
    uiHidden.value = false;
    drawableEvents.value = [];
  }

  return {
    phase,
    background,
    foreground,
    dialogue,
    choices,
    currentLocationId,
    availableActions,
    availableLocations,
    menuOpen,
    skipMode,
    autoMode,
    historyBrowsing,
    uiHidden,
    drawableEvents,
    setDialogue,
    setChoices,
    setBackground,
    setForeground,
    setPhase,
    setLocation,
    setActions,
    setLocations,
    openMenu,
    closeMenu,
    setDrawableEvents,
    $reset,
  };
});
