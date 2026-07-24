<script setup>
import { RouterLink } from "vue-router"
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink
        class="brand"
        :to="{ name: 'home' }"
      >
        VueMart
      </RouterLink>

      <nav
        class="main-nav"
        aria-label="主要導覽"
      >
        <RouterLink
          class="nav-link"
          :to="{ name: 'home' }"
        >
          首頁
        </RouterLink>

        <RouterLink
          class="nav-link"
          :to="{ name: 'cart' }"
        >
          購物車
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 10;
  top: 0;
  background-color: rgb(255 255 255 / 92%);
  border-bottom: 1px solid #cbd5e1;
  backdrop-filter: blur(12px);
}

.header-inner {
  display: flex;
  width: min(100%, 1040px);
  align-items: center;
  gap: 24px;
  margin: 0 auto;
  padding: 16px 20px;
}

.brand {
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.nav-link {
  padding: 10px 14px;
  color: #334155;
  font-weight: 700;
  text-decoration: none;
  border-radius: 10px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.nav-link:hover {
  color: #0f766e;
  background-color: #f0fdfa;
}

.nav-link.router-link-active {
  color: #ffffff;
  background-color: #0f766e;
}

.nav-link:focus-visible,
.brand:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

@media (max-width: 480px) {
  .header-inner {
    gap: 12px;
    padding: 12px 16px;
  }

  .brand {
    font-size: 1.15rem;
  }

  .nav-link {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}
</style>