<template>
  <div class="relative w-full h-full overflow-hidden bg-black" style="container-type: size">
    <!-- z-0: Background -->
    <BackgroundLayer />

    <!-- z-10: Foreground / character sprites -->
    <ForegroundLayer />

    <!-- UI layer — hidden with H key (Ren'Py style) -->
    <template v-if="!engineState.uiHidden">
      <!-- z-15: Drawable events (clickable characters/objects) -->
      <DrawableOverlay />

      <!-- z-20: Location + Action overlays (left / right panels) -->
      <LocationOverlay />
      <ActionOverlay />

      <!-- z-25: Top bar -->
      <TopBar />

      <!-- z-30: Dialogue box -->
      <DialogueBox />

      <!-- z-35: Choice panel (inside DialogueBox z-range) -->
      <ChoicePanel />

      <!-- z-40: Custom overlay -->
      <CustomOverlay />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useEngineStateStore } from '../../stores/engineState';
import BackgroundLayer from '../core/BackgroundLayer.vue';
import ForegroundLayer from '../core/ForegroundLayer.vue';
import DrawableOverlay from '../core/DrawableOverlay.vue';
import DialogueBox from '../core/DialogueBox.vue';
import ChoicePanel from '../core/ChoicePanel.vue';
import CustomOverlay from '../core/CustomOverlay.vue';
import ActionOverlay from '../menu/ActionOverlay.vue';
import LocationOverlay from '../menu/LocationOverlay.vue';
import TopBar from '../menu/TopBar.vue';

const engineState = useEngineStateStore();
</script>
