<template>
  <div class="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
    <div class="text-white text-2xl font-mono animate-pulse">Loading...</div>
    <div class="mt-4 w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
</template>

<script setup lang="ts">
// No props — this is a pure presentational loading screen.
</script>
