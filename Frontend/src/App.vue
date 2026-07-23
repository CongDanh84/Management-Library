<script setup>
import AppHeader from './components/common/AppHeader.vue'
import ToastContainer from './components/common/ToastContainer.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="container app-main">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <ToastContainer />
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.app-main { flex: 1; padding: var(--space-6) var(--space-5) var(--space-8); width: 100%; }
</style>
