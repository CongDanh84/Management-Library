<script setup>
defineProps({
  title: { type: String, default: 'Chưa có dữ liệu' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'book' } // book | search | tray
})
</script>

<template>
  <div class="empty-state fade-stagger">
    <svg v-if="icon === 'book'" width="56" height="56" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" stroke-width="1.4"/>
      <path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke="currentColor" stroke-width="1.4"/>
    </svg>
    <svg v-else-if="icon === 'search'" width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M20 20l-4.5-4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>
    <svg v-else width="56" height="56" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="9" width="18" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M3 9l3-5h12l3 5" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-5);
  color: var(--color-ink-faint);
}
.empty-state svg { color: var(--color-border); }
.empty-state h3 { font-size: 18px; color: var(--color-ink-soft); }
.empty-state p { font-size: 14px; max-width: 360px; }
</style>
