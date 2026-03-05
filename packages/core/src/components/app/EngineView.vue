<template>
  <div class="relative w-full h-full overflow-hidden bg-black" style="container-type: size">
    <!-- z-0: Background -->
    <component :is="backgroundLayerComponent" />

    <!-- z-10: Foreground / character sprites -->
    <component :is="foregroundLayerComponent" />

    <!-- UI layer — hidden with H key (Ren'Py style) -->
    <template v-if="!engineState.uiHidden">
      <!-- z-15–25: HUD (hidden during dialogue/choices) -->
      <template v-if="!hideHud">
        <component :is="drawableOverlayComponent" />
        <component :is="locationOverlayComponent" />
        <component :is="actionOverlayComponent" />
        <component :is="topBarComponent" />
      </template>

      <!-- z-30: Dialogue box -->
      <component :is="dialogueBoxComponent" />

      <!-- z-35: Choice panel (inside DialogueBox z-range) -->
      <component :is="choicePanelComponent" />

      <!-- z-45: Project HUD (always visible when UI is shown) -->
      <slot name="hud" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { getComponentOverride } from '../../engine/core/EngineFactory';
import DefaultBackgroundLayer from '../core/BackgroundLayer.vue';
import DefaultForegroundLayer from '../core/ForegroundLayer.vue';
import DefaultDrawableOverlay from '../core/DrawableOverlay.vue';
import DefaultDialogueBox from '../core/DialogueBox.vue';
import DefaultChoicePanel from '../core/ChoicePanel.vue';
import DefaultActionOverlay from '../menu/ActionOverlay.vue';
import DefaultLocationOverlay from '../menu/LocationOverlay.vue';
import DefaultTopBar from '../menu/TopBar.vue';

const engineState = useEngineStateStore();
const hideHud = computed(() => !!engineState.dialogue || !!engineState.choices);

const backgroundLayerComponent = computed(() => getComponentOverride('BackgroundLayer') ?? DefaultBackgroundLayer);
const foregroundLayerComponent = computed(() => getComponentOverride('ForegroundLayer') ?? DefaultForegroundLayer);
const topBarComponent = computed(() => getComponentOverride('TopBar') ?? DefaultTopBar);
const actionOverlayComponent = computed(() => getComponentOverride('ActionOverlay') ?? DefaultActionOverlay);
const locationOverlayComponent = computed(() => getComponentOverride('LocationOverlay') ?? DefaultLocationOverlay);
const dialogueBoxComponent = computed(() => getComponentOverride('DialogueBox') ?? DefaultDialogueBox);
const choicePanelComponent = computed(() => getComponentOverride('ChoicePanel') ?? DefaultChoicePanel);
const drawableOverlayComponent = computed(() => getComponentOverride('DrawableOverlay') ?? DefaultDrawableOverlay);
</script>
