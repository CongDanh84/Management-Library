<script setup>
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '../../constants/routes'
</script>

<template>
  <div class="auth-select fade-stagger">
    <div class="auth-select-intro">
      <span class="eyebrow">Chào mừng trở lại</span>
      <h1>Bạn đăng nhập với vai trò nào?</h1>
      <p>Chọn loại tài khoản để tiếp tục truy cập hệ thống thư viện.</p>
    </div>
    <div class="auth-select-grid">
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN_READER }" class="role-card card">
        <span class="role-icon">🎓</span>
        <h3>Độc giả</h3>
        <p>Tra cứu, mượn sách và theo dõi lịch sử mượn của bạn.</p>
        <span class="role-cta">Đăng nhập độc giả →</span>
      </RouterLink>
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN_STAFF }" class="role-card card">
        <span class="role-icon">🗂️</span>
        <h3>Thủ thư / Quản trị</h3>
        <p>Quản lý sách, NXB, phiếu mượn trả và độc giả.</p>
        <span class="role-cta">Đăng nhập nhân viên →</span>
      </RouterLink>
    </div>
    <p class="auth-select-register">
      Chưa có tài khoản độc giả? <RouterLink :to="{ name: ROUTE_NAMES.REGISTER_READER }">Đăng ký ngay</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.auth-select { max-width: 720px; margin: var(--space-7) auto; text-align: center; }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }
h1 { font-size: 32px; margin-top: var(--space-3); }
.auth-select-intro p { color: var(--color-ink-soft); margin-top: var(--space-3); }
.auth-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin-top: var(--space-7);
}
.role-card {
  padding: var(--space-6);
  text-align: left;
  transition: all 0.3s var(--ease);
}
.role-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-raised); border-color: var(--color-primary); }
.role-icon { font-size: 28px; }
.role-card h3 { margin-top: var(--space-3); font-size: 18px; }
.role-card p { color: var(--color-ink-soft); font-size: 14px; margin-top: var(--space-2); }
.role-cta { display: inline-block; margin-top: var(--space-4); font-weight: 600; color: var(--color-primary); font-size: 14px; }
.auth-select-register { margin-top: var(--space-6); font-size: 14px; color: var(--color-ink-soft); }
.auth-select-register a { color: var(--color-primary); font-weight: 600; }
@media (max-width: 640px) { .auth-select-grid { grid-template-columns: 1fr; } }
</style>
