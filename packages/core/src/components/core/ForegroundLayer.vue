<template>
  <div
    v-if="engineState.foreground"
    ref="containerRef"
    class="absolute inset-0 z-10 pointer-events-none overflow-hidden"
  >
    <img
      v-if="blurUrl"
      :src="blurUrl"
      alt=""
      class="fg-blur absolute inset-0 w-full h-full object-cover"
    />
    <!-- Stage: sized to first image's natural aspect, scaled to fit container -->
    <div class="absolute inset-0 flex items-end justify-center">
      <div
        class="relative shrink-0"
        :style="stageStyle"
      >
        <TransitionGroup name="fg-fade">
          <div
            v-for="(layer, i) in engineState.foreground"
            :key="layer.path + '-' + i"
            class="absolute"
            :class="anchorClass(layer)"
            :style="layerPosition(layer)"
          >
            <img
              :src="resolveUrl(layer.path)"
              alt=""
              :style="imgScale(layer)"
              @load="i === 0 ? onRefImageLoad($event) : undefined"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { assetUrl } from '../../utils/assetUrl';
import type { ForegroundLayer } from '../../engine/types';

const engineState = useEngineStateStore();

const containerRef = ref<HTMLElement | null>(null);
const containerW = ref(0);
const containerH = ref(0);

/** First image's natural dimensions (the reference frame) */
const refNaturalW = ref(0);
const refNaturalH = ref(0);

let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!containerRef.value) return;
  observer = new ResizeObserver(([entry]) => {
    containerW.value = entry.contentRect.width;
    containerH.value = entry.contentRect.height;
  });
  observer.observe(containerRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});

// Reset natural dimensions when foreground layers change
watch(() => engineState.foreground?.[0]?.path, () => {
  refNaturalW.value = 0;
  refNaturalH.value = 0;
});

function resolveUrl(path: string): string {
  return assetUrl(path);
}

function onRefImageLoad(event: Event): void {
  const img = event.target as HTMLImageElement;
  refNaturalW.value = img.naturalWidth;
  refNaturalH.value = img.naturalHeight;
}

const blurUrl = computed(() => {
  const layers = engineState.foreground;
  if (!layers || layers.length === 0) return '';
  return resolveUrl(layers[0].path);
});

/** Scale factor: how much the first image must scale to fit the container (object-contain logic) */
const fitScale = computed(() => {
  if (containerW.value === 0 || containerH.value === 0) return 1;
  if (refNaturalW.value === 0 || refNaturalH.value === 0) return 1;
  return Math.min(
    containerW.value / refNaturalW.value,
    containerH.value / refNaturalH.value,
  );
});

/** Stage dimensions: first image's natural size scaled to fit */
const stageStyle = computed(() => {
  if (refNaturalW.value === 0 || refNaturalH.value === 0) return {};
  return {
    width: `${refNaturalW.value * fitScale.value}px`,
    height: `${refNaturalH.value * fitScale.value}px`,
  };
});

function anchorClass(layer: ForegroundLayer): string {
  return layer.anchor === 'center'
    ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
    : 'left-1/2 bottom-0 -translate-x-1/2';
}

function layerPosition(layer: ForegroundLayer): Record<string, string> {
  const x = layer.x ?? 0;
  const y = layer.y ?? 0;
  const style: Record<string, string> = {};
  if (x !== 0) style.marginLeft = `${x * fitScale.value * refNaturalW.value / 100}px`;
  if (y !== 0) style.marginBottom = `${-y * fitScale.value * refNaturalH.value / 100}px`;
  return style;
}

function imgScale(layer: ForegroundLayer): Record<string, string> {
  const s = layer.scale ?? 1;
  const base = fitScale.value;
  return {
    transform: `scale(${base * s})`,
    transformOrigin: layer.anchor === 'center' ? 'center' : 'bottom center',
  };
}
</script>

<style scoped>
.fg-blur {
  filter: blur(80px);
  transform: scale(1.2);
}

.fg-fade-enter-active,
.fg-fade-leave-active {
  transition: opacity 0.3s ease;
}
.fg-fade-enter-from,
.fg-fade-leave-to {
  opacity: 0;
}
</style>
