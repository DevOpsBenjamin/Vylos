<template>
  <Transition name="fg-fade">
    <div
      v-if="engineState.foreground"
      class="absolute inset-0 z-10 pointer-events-none overflow-hidden"
    >
      <img
        v-if="blurUrl"
        :src="blurUrl"
        alt=""
        class="fg-blur absolute inset-0 w-full h-full object-cover"
      />
      <!-- Stage: always mounted, observes container size -->
      <div
        ref="stageRef"
        style="position: absolute; inset: 0; overflow: hidden;"
      >
        <!-- Scene: natural pixel size, centered and scaled to fit -->
        <div
          v-if="sceneReady"
          :style="{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: scene.width + 'px',
            height: scene.height + 'px',
            transform: `translate(-50%, -50%) scale(${sceneFitScale})`,
            transformOrigin: 'center',
          }"
        >
          <img
            v-for="(layer, i) in scene.layers"
            :key="layer.path + '-' + i"
            :src="resolveUrl(layer.path)"
            alt=""
            :style="layerStyle(layer)"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { assetUrl } from '../../utils/assetUrl';
import type { ForegroundLayer } from '../../engine/types';

interface LayerMeta {
  path: string;
  naturalWidth: number;
  naturalHeight: number;
  x: number;
  y: number;
  scale: number;
  anchor: 'center' | 'bottom-center';
}

interface Scene {
  width: number;
  height: number;
  layers: LayerMeta[];
}

const engineState = useEngineStateStore();

const stageRef = ref<HTMLElement | null>(null);
const containerW = ref(0);
const containerH = ref(0);

const scene = ref<Scene>({ width: 0, height: 0, layers: [] });
const sceneReady = ref(false);

// --- ResizeObserver on stage (always mounted when foreground active) ---
let observer: ResizeObserver | null = null;

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    containerW.value = entry.contentRect.width;
    containerH.value = entry.contentRect.height;
  });
  if (stageRef.value) observer.observe(stageRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});

// Re-attach observer when stageRef appears (v-if toggles)
watch(stageRef, (el) => {
  observer?.disconnect();
  if (el) observer?.observe(el);
});

// --- Image metadata loading ---
function loadImageMeta(path: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = assetUrl(path);
  });
}

// --- Build scene when foreground changes ---
watch(
  () => engineState.foreground,
  async (layers) => {
    if (!layers || layers.length === 0) {
      sceneReady.value = false;
      return;
    }

    const metas = await Promise.all(layers.map((l) => loadImageMeta(l.path)));

    const baseW = metas[0].width;
    const baseH = metas[0].height;
    if (baseW === 0 || baseH === 0) {
      sceneReady.value = false;
      return;
    }

    scene.value = {
      width: baseW,
      height: baseH,
      layers: layers.map((l, i) => ({
        path: l.path,
        naturalWidth: metas[i].width,
        naturalHeight: metas[i].height,
        x: l.x ?? 0,
        y: l.y ?? 0,
        scale: l.scale ?? 1,
        anchor: l.anchor ?? 'bottom-center',
      })),
    };
    sceneReady.value = true;
  },
  { immediate: true },
);

// --- Scale: one number, min(containerW/sceneW, containerH/sceneH) ---
const sceneFitScale = computed(() => {
  if (!sceneReady.value || containerW.value === 0 || containerH.value === 0) return 1;
  return Math.min(
    containerW.value / scene.value.width,
    containerH.value / scene.value.height,
  );
});

// --- Helpers ---
function resolveUrl(path: string): string {
  return assetUrl(path);
}

const blurUrl = computed(() => {
  const layers = engineState.foreground;
  if (!layers || layers.length === 0) return '';
  return resolveUrl(layers[0].path);
});

function layerStyle(layer: LayerMeta): Record<string, string> {
  const isCenter = layer.anchor === 'center';

  // Normalize every layer to the scene height so all sprites are proportionate
  const heightScale = scene.value.height / layer.naturalHeight;
  const displayW = layer.naturalWidth * heightScale;
  const displayH = scene.value.height;

  // x/y are percentages of scene dimensions (resolution-independent)
  const xPx = (layer.x / 100) * scene.value.width;
  const yPx = (layer.y / 100) * scene.value.height;

  const style: Record<string, string> = {
    position: 'absolute',
    width: displayW + 'px',
    height: displayH + 'px',
  };

  if (isCenter) {
    style.left = '50%';
    style.top = '50%';
    style.transform = `translate(calc(-50% + ${xPx}px), calc(-50% + ${yPx}px))`;
  } else {
    style.left = '50%';
    style.bottom = '0';
    style.transform = `translateX(calc(-50% + ${xPx}px))`;
    if (yPx !== 0) style.bottom = yPx + 'px';
  }

  if (layer.scale !== 1) {
    style.transform += ` scale(${layer.scale})`;
    style.transformOrigin = isCenter ? 'center' : 'bottom center';
  }

  return style;
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
