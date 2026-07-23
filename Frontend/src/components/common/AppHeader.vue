<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import { ROUTE_NAMES } from '../../constants/routes'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const mobileOpen = ref(false)

const navItems = computed(() => {
  if (!auth.isAuthenticated) return [{ name: ROUTE_NAMES.BOOK_LIST, label: 'Danh mục sách' }]
  if (auth.isReader) {
    return [
      { name: ROUTE_NAMES.BOOK_LIST, label: 'Danh mục sách' },
      { name: ROUTE_NAMES.MY_BORROWS, label: 'Sách đang mượn' },
      { name: ROUTE_NAMES.MY_PROFILE, label: 'Trang cá nhân' }
    ]
  }
  // staff
  const items = [
    { name: ROUTE_NAMES.BOOK_LIST, label: 'Danh mục sách' },
    { name: ROUTE_NAMES.MANAGE_BORROWS, label: 'Mượn / Trả' },
    { name: ROUTE_NAMES.MANAGE_BOOKS, label: 'Quản lý sách' },
    { name: ROUTE_NAMES.MANAGE_PUBLISHERS, label: 'NXB' },
    { name: ROUTE_NAMES.MANAGE_READERS, label: 'Độc giả' }
  ]
  if (auth.isAdmin) items.push({ name: ROUTE_NAMES.MANAGE_STAFFS, label: 'Nhân sự' })
  items.push({ name: ROUTE_NAMES.STAFF_PROFILE, label: 'Hồ sơ' })
  return items
})

async function handleLogout() {
  await auth.logout()
  toast.info('Đã đăng xuất.')
  router.push({ name: ROUTE_NAMES.LOGIN_SELECT })
}
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/sach" class="brand">
        <span class="brand-mark">📖</span>
        <span class="brand-text">Thư Viện Số</span>
      </RouterLink>

      <nav class="nav-desktop">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-link"
          :class="{ active: route.name === item.name }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <template v-if="auth.isAuthenticated">
          <span class="user-chip">
            <span class="user-name">{{ auth.displayName }}</span>
            <span class="code-stamp">{{ auth.myCode }}</span>
          </span>
          <button class="btn btn-ghost btn-sm" @click="handleLogout">Đăng xuất</button>
        </template>
        <template v-else>
          <RouterLink to="/dang-nhap" class="btn btn-primary btn-sm">Đăng nhập</RouterLink>
        </template>

        <button class="burger" @click="mobileOpen = !mobileOpen" aria-label="Mở menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <Transition name="drop">
      <nav v-if="mobileOpen" class="nav-mobile">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-link-mobile"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 247, 240, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border-soft);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: var(--space-5);
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  flex-shrink: 0;
}
.brand-mark { font-size: 22px; }
.nav-desktop {
  display: flex;
  gap: var(--space-5);
  flex: 1;
  overflow-x: auto;
}
.nav-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink-soft);
  padding: 8px 2px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s var(--ease);
  white-space: nowrap;
}
.nav-link:hover { color: var(--color-primary); }
.nav-link.active { color: var(--color-primary); border-bottom-color: var(--color-accent); }
.header-actions { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
.user-chip { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.user-name { font-size: 13px; font-weight: 600; }
.burger { display: none; flex-direction: column; gap: 4px; background: none; border: none; padding: 8px; }
.burger span { width: 20px; height: 2px; background: var(--color-ink); border-radius: 2px; }
.nav-mobile { display: none; }

@media (max-width: 860px) {
  .nav-desktop { display: none; }
  .burger { display: flex; }
  .nav-mobile {
    display: flex; flex-direction: column;
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--color-border-soft);
    background: var(--color-paper-raised);
  }
  .nav-link-mobile { padding: 12px 0; font-weight: 600; border-bottom: 1px solid var(--color-border-soft); }
  .user-name { display: none; }
}
.drop-enter-active, .drop-leave-active { transition: all 0.25s var(--ease); }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
