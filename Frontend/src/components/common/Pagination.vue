<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, default: 0 }
})
const emit = defineEmits(['change'])

function go(p) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('change', p)
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <span class="pagination-info">{{ totalItems }} kết quả · Trang {{ page }}/{{ totalPages }}</span>
    <div class="pagination-controls">
      <button class="btn btn-secondary btn-sm" :disabled="page <= 1" @click="go(page - 1)">‹ Trước</button>
      <button class="btn btn-secondary btn-sm" :disabled="page >= totalPages" @click="go(page + 1)">Sau ›</button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-top: var(--space-5);
  flex-wrap: wrap;
}
.pagination-info { font-size: 13px; color: var(--color-ink-soft); }
.pagination-controls { display: flex; gap: var(--space-2); }
</style>
