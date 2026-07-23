<script setup>
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '../constants/routes'
</script>

<template>
  <div class="status-page fade-stagger">
    <span class="status-code">403</span>
    <h1>Bạn không có quyền truy cập trang này</h1>
    <p>Tài khoản hiện tại của bạn không đủ quyền để xem nội dung này.</p>
    <RouterLink :to="{ name: ROUTE_NAMES.BOOK_LIST }" class="btn btn-primary">Về danh mục sách</RouterLink>
  </div>
</template>

<style scoped>
.status-page {
  max-width: 480px;
  margin: var(--space-8) auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.status-code {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.1em;
  color: var(--color-danger);
  background: var(--color-danger-tint);
  padding: 4px 14px;
  border-radius: 999px;
  font-weight: 700;
}
.status-page h1 { font-size: 24px; margin-top: var(--space-3); }
.status-page p { color: var(--color-ink-soft); margin-bottom: var(--space-4); }
</style>