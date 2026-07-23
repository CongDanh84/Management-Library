<script setup>
defineProps({
  count: { type: Number, default: 8 },
  type: { type: String, default: 'card' } // card | row
})
</script>

<template>
  <div v-if="type === 'card'" class="skeleton-grid">
    <div v-for="i in count" :key="i" class="skeleton-card" :style="{ animationDelay: `${i * 0.05}s` }">
      <div class="skeleton" style="height: 120px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 14px; width: 80%; margin-bottom: 8px;"></div>
      <div class="skeleton" style="height: 12px; width: 50%;"></div>
    </div>
  </div>
  <div v-else class="skeleton-rows">
    <div v-for="i in count" :key="i" class="skeleton" style="height: 48px;" :style="{ animationDelay: `${i * 0.04}s` }"></div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
.skeleton-card { animation: fadeUp 0.4s var(--ease) both; }
.skeleton-rows { display: flex; flex-direction: column; gap: var(--space-2); }
</style>
