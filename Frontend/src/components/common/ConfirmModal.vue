<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, default: 'Bạn có chắc chắn muốn thực hiện hành động này?' },
  danger: { type: Boolean, default: false },
  confirmText: { type: String, default: 'Xác nhận' },
  loading: { type: Boolean, default: false },
  // Dùng khi hành động phía sau đã xảy ra không thể "Hủy" được nữa
  // (vd: server đã revoke session) — ẩn nút Hủy và chặn đóng bằng click ra ngoài / phím Esc.
  forceConfirm: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

function close() {
  if (props.forceConfirm) return // không cho đóng bằng cách nào khác ngoài bấm nút xác nhận
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-box card">
          <h3>{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button v-if="!forceConfirm" class="btn btn-secondary" @click="close" :disabled="loading">Hủy</button>
            <button
              :class="danger ? 'btn btn-danger' : 'btn btn-primary'"
              @click="emit('confirm')"
              :disabled="loading"
            >
              {{ loading ? 'Đang xử lý…' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(34, 38, 43, 0.45);
  backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: var(--space-5);
}
.modal-box { padding: var(--space-6); max-width: 400px; width: 100%; }
.modal-message { margin-top: var(--space-3); color: var(--color-ink-soft); font-size: 14px; line-height: 1.6; }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-6); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s var(--ease); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.25s var(--ease); }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.96) translateY(8px); }
</style>