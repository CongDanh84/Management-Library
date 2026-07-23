import { reactive } from 'vue'

// State dùng chung toàn cục cho toàn bộ app (không cần Pinia vì rất đơn giản)
const toasts = reactive([])
let idCounter = 0

function push(message, type = 'info', timeout = 3500) {
  const id = ++idCounter
  toasts.push({ id, message, type })
  if (timeout > 0) {
    setTimeout(() => remove(id), timeout)
  }
  return id
}

function remove(id) {
  const idx = toasts.findIndex((t) => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

export function useToast() {
  return {
    toasts,
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
    remove
  }
}
