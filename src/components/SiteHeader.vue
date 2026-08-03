<script setup>
import {
  RouterLink,
  useRouter,
} from "vue-router"

import { useAuthStore } from "../stores/auth.js"
import { useCartStore } from "../stores/cart.js"
import { handleShowToast } from "../utils/toastHelper.js"

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const handleLogout = () => {
  const result = authStore.logout()

  handleShowToast(result)

  router.push({
    name: "home",
  })
}
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
          :to="{ name: 'product' }"
        >
          商品列表
        </RouterLink>

        <RouterLink
          class="nav-link"
          :to="{ name: 'cart' }"
          :aria-label="
            `購物車，共 ${cartStore.totalQuantity} 件商品`
          "
        >
          <span>購物車</span>

          <span
            v-if="cartStore.totalQuantity > 0"
            class="cart-count"
            aria-hidden="true"
          >
            {{ cartStore.totalQuantity }}
          </span>
        </RouterLink>

        <template v-if="authStore.isLogin">
          <RouterLink
            class="nav-link"
            :to="{ name: 'orders' }"
          >
            我的訂單
          </RouterLink>
          
          <span class="member-name">
            你好，{{ authStore.user?.name }}
          </span>

          <button
            type="button"
            class="logout-button"
            @click="handleLogout"
          >
            登出
          </button>
        </template>

        <RouterLink
          v-else
          class="nav-link login-link"
          :to="{ name: 'login' }"
        >
          登入
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 20;
  top: 0;
  background-color: rgb(255 255 255 / 92%);
  border-bottom: 1px solid #cbd5e1;
  backdrop-filter: blur(12px);
}

.header-inner {
  display: flex;
  width: min(100%, 1120px);
  min-height: 72px;
  align-items: center;
  gap: 24px;
  margin: 0 auto;
  padding: 12px 20px;
}

.brand {
  flex-shrink: 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.main-nav {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.nav-link,
.logout-button {
  display: inline-flex;
  min-height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font: inherit;
  font-weight: 700;
  border-radius: 10px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.nav-link {
  color: #334155;
  text-decoration: none;
}

.nav-link:hover {
  color: #0f766e;
  background-color: #f0fdfa;
}

.nav-link.router-link-active {
  color: #ffffff;
  background-color: #0f766e;
}

.login-link {
  color: #0f766e;
  border: 1px solid #0f766e;
}

.login-link:hover {
  color: #ffffff;
  background-color: #0f766e;
}

.login-link.router-link-active {
  color: #ffffff;
  background-color: #0f766e;
}

.cart-count {
  display: grid;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  place-items: center;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 900;
  line-height: 1;
  background-color: #ccfbf1;
  border-radius: 999px;
}

.nav-link.router-link-active .cart-count {
  color: #0f172a;
  background-color: #ffffff;
}

.member-name {
  max-width: 160px;
  overflow: hidden;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-button {
  color: #b91c1c;
  background-color: #ffffff;
  border: 1px solid #fca5a5;
  cursor: pointer;
}

.logout-button:hover {
  color: #ffffff;
  background-color: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
}

.nav-link:focus-visible,
.brand:focus-visible,
.logout-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

@media (max-width: 800px) {
  .header-inner {
    flex-wrap: wrap;
    gap: 10px 16px;
    padding: 12px 16px;
  }

  .main-nav {
    width: 100%;
    overflow-x: auto;
    margin-left: 0;
    padding-bottom: 2px;
  }

  .member-name {
    margin-left: auto;
  }
}

@media (max-width: 560px) {
  .brand {
    font-size: 1.2rem;
  }

  .main-nav {
    gap: 6px;
  }

  .nav-link,
  .logout-button {
    min-height: 38px;
    padding: 8px 10px;
    font-size: 0.88rem;
  }

  .member-name {
    display: none;
  }

  .cart-count {
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .logout-button {
    transition: none;
  }

  .logout-button:hover {
    transform: none;
  }
}
</style>