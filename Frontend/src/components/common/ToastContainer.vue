<script setup>
import { useToast } from '../../composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="`toast-${t.type}`"
          @click="remove(t.id)"
        >
          <span class="toast-icon">
            <svg v-if="t.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else-if="t.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 11v5M12 7.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: var(--space-5);
  right: var(--space-5);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 340px;
}
.toast-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-raised);
  cursor: pointer;
  background: var(--color-paper-raised);
  border: 1px solid var(--color-border-soft);
  color: var(--color-ink);
}
.toast-icon { flex-shrink: 0; margin-top: 1px; }
.toast-success { border-color: var(--color-success-tint); color: var(--color-success); }
.toast-error { border-color: var(--color-danger-tint); color: var(--color-danger); }
.toast-info { color: var(--color-primary); border-color: var(--color-primary-tint); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s var(--ease); }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
