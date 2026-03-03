<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans antialiased">
    <!-- Hero -->
    <section class="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 overflow-hidden">
      <!-- Glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none"></div>

      <h1 class="relative text-6xl sm:text-7xl font-bold tracking-wider uppercase text-center">
        <span class="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Vylos</span>
      </h1>

      <!-- Separator -->
      <div class="mt-6 w-48 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-full"></div>

      <p class="mt-6 text-lg text-gray-400 tracking-wide uppercase font-mono text-center">The Sandbox Visual Novel Engine</p>

      <p class="mt-4 max-w-xl text-center text-gray-500 leading-relaxed">
        TypeScript-first, checkpoint-based execution inspired by Ren'Py.
        Build sandbox VNs with locations, actions, stats, and full plugin customization.
      </p>

      <!-- Install snippet -->
      <div class="mt-8 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 font-mono text-sm">
        <span class="text-gray-500">$</span>
        <code class="text-violet-300">pnpm add @vylos/core</code>
        <button
          class="ml-2 text-gray-500 hover:text-white transition-colors cursor-pointer"
          title="Copy"
          @click="copy('pnpm add @vylos/core')"
        >{{ copied ? '\u2713' : '\u2398' }}</button>
      </div>

      <!-- CTAs -->
      <div class="mt-10 flex flex-wrap gap-4 justify-center">
        <a
          href="https://github.com/DevOpsBenjamin/vylos"
          target="_blank"
          rel="noopener"
          class="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
        >GitHub</a>
        <a
          href="https://www.npmjs.com/package/@vylos/core"
          target="_blank"
          rel="noopener"
          class="px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 text-white font-semibold transition-colors"
        >npm</a>
      </div>
    </section>

    <!-- Why Vylos -->
    <section class="max-w-5xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-bold text-center mb-12">Why Vylos</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div v-for="reason in reasons" :key="reason.title" class="feature-card">
          <span class="text-3xl mb-3 block">{{ reason.icon }}</span>
          <h3 class="text-lg font-semibold mb-1">{{ reason.title }}</h3>
          <p class="text-sm text-gray-400 leading-relaxed">{{ reason.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Demos -->
    <section class="max-w-5xl mx-auto px-6 py-20">
      <h2 class="text-3xl font-bold text-center mb-12">Live Demos</h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a
          v-for="demo in demos"
          :key="demo.title"
          :href="demo.href"
          class="demo-card group"
        >
          <span class="text-4xl mb-4 block">{{ demo.icon }}</span>
          <h3 class="text-lg font-semibold mb-1 group-hover:text-violet-400 transition-colors">{{ demo.title }}</h3>
          <p class="text-sm text-gray-400 leading-relaxed">{{ demo.desc }}</p>
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-10 text-center text-sm text-gray-500">
      <div class="flex items-center justify-center gap-6 mb-4">
        <a href="https://github.com/DevOpsBenjamin/vylos" target="_blank" rel="noopener" class="hover:text-white transition-colors">GitHub</a>
        <a href="https://www.npmjs.com/package/@vylos/core" target="_blank" rel="noopener" class="hover:text-white transition-colors">npm</a>
      </div>
      <p>MIT License</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const base = import.meta.env.BASE_URL;

const copied = ref(false);

function copy(text: string) {
  navigator.clipboard.writeText(text);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

const reasons = [
  {
    icon: '\u{1F30D}',
    title: 'Sandbox First',
    desc: 'Locations, actions, time systems, stats, and inventory out of the box. Your game is a world to explore, not a linear script.',
  },
  {
    icon: '\u{1F6E1}\u{FE0F}',
    title: 'TypeScript Safety',
    desc: 'Typed events, typed game state, full autocomplete. No mistyped variable names silently breaking your game at runtime.',
  },
  {
    icon: '\u{1F9E9}',
    title: 'Plugin Everything',
    desc: 'Swap any UI component, override any manager via DI, inject custom Pinia stores. The engine adapts to your game.',
  },
];

const demos = [
  { icon: '\u{1F3E0}', title: '1-basic', desc: 'Minimal demo — 3 locations, day/night cycle, 1 NPC, custom game state.', href: `${base}1-basic/` },
  { icon: '\u{2728}', title: '2-advanced', desc: 'Full showcase — plugin TopBar, journal overlay, DI items, typed helpers, i18n.', href: `${base}2-advanced/` },
  { icon: '\u{1F4F1}', title: '3-phone', desc: 'Phone UI with full component overrides (GameShell, TopBar, DialogueBox).', href: `${base}3-phone/` },
];
</script>

<style scoped>
.font-sans {
  font-family: 'Inter', system-ui, sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.feature-card {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  transition: border-color 0.25s, box-shadow 0.25s;
}

.feature-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.08);
}

.demo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
  text-decoration: none;
  color: inherit;
}

.demo-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.12);
  transform: translateY(-2px);
}
</style>
