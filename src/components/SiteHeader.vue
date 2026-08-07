<script setup>
import {
  computed,
} from "vue"

import {
  RouterLink,
  useRoute,
  useRouter,
} from "vue-router"

import {
  useCartStore,
} from "../stores/cart.js"

import {
  useAuthStore,
} from "../stores/auth.js"

import {
  handleShowToast,
} from "../utils/toastHelper.js"

const cartStore = useCartStore()
const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

// ==================================================
// 判斷目前是否位於後台相關頁面
// ==================================================
//
// RouterLink 會自動加入 router-link-active，
// 但新增商品與編輯商品通常是其他路由紀錄，
// 因此額外判斷路徑是否以 /admin 開頭。
const isAdminRoute = computed(() => {
  return route.path.startsWith(
    "/admin",
  )
})

// ==================================================
// 取得使用者名稱的第一個字
// ==================================================
//
// 例如：
// "王小明" → "王"
// "管理員" → "管"
//
// 如果使用者名稱不存在，使用「會」作為預設文字。
const userInitial = computed(() => {
  const userName =
    authStore.user?.name

  if (
    typeof userName !== "string" ||
    !userName.trim()
  ) {
    return "會"
  }

  return userName
    .trim()
    .slice(0, 1)
})

// ==================================================
// 登出
// ==================================================

const handleLogout = () => {
  const result =
    authStore.logout()

  handleShowToast(result)

  router.push({
    name: "home",
  })
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <!-- 網站品牌 -->
      <RouterLink
        class="brand"
        :to="{
          name: 'home',
        }"
      >
        VueMart
      </RouterLink>

      <!-- 主要導覽 -->
      <nav
        class="main-nav"
        aria-label="主要導覽"
      >
        <!-- 首頁 -->
        <RouterLink
          class="nav-link"
          :to="{
            name: 'home',
          }"
        >
          首頁
        </RouterLink>

        <!-- 商品列表 -->
        <RouterLink
          class="nav-link"
          :to="{
            name: 'product',
          }"
        >
          商品列表
        </RouterLink>

        <!--
          只有管理員才能看見後台入口。

          isAdminRoute 可以讓新增商品、
          編輯商品等後台頁面也保持選取狀態。
        -->
        <RouterLink
          v-if="authStore.isAdmin"
          class="nav-link admin-nav-link"
          :class="{
            'admin-nav-link--active':
              isAdminRoute,
          }"
          :to="{
            name: 'admin-products',
          }"
        >
          後台管理
        </RouterLink>

        <!-- 購物車 -->
        <RouterLink
          class="nav-link"
          :to="{
            name: 'cart',
          }"
          :aria-label="
            `購物車，共 ${cartStore.totalQuantity} 件商品`
          "
        >
          <span>購物車</span>

          <span
            v-if="
              cartStore.totalQuantity > 0
            "
            class="cart-count"
            aria-hidden="true"
          >
            {{
              cartStore.totalQuantity
            }}
          </span>
        </RouterLink>

        <!-- 已登入 -->
        <template
          v-if="authStore.isLogin"
        >
          <!-- 我的訂單 -->
          <RouterLink
            class="nav-link"
            :to="{
              name: 'orders',
            }"
          >
            我的訂單
          </RouterLink>

          <!-- 使用者操作區 -->
          <div class="member-actions">
            <!-- 使用者資訊卡片 -->
            <div
              class="user-badge"
              :class="{
                'user-badge--admin':
                  authStore.isAdmin,
              }"
              :aria-label="
                `目前登入使用者：${authStore.user?.name}`
              "
            >
              <!-- 文字頭像 -->
              <span
                class="user-avatar"
                aria-hidden="true"
              >
                {{ userInitial }}
              </span>

              <!-- 身分與名稱 -->
              <span
                class="user-information"
              >
                <span class="user-role">
                  {{
                    authStore.isAdmin
                      ? "管理員"
                      : "一般會員"
                  }}
                </span>

                <strong class="user-name">
                  {{
                    authStore.user?.name
                  }}
                </strong>
              </span>
            </div>

            <!-- 登出 -->
            <button
              type="button"
              class="logout-button"
              @click="handleLogout"
            >
              登出
            </button>
          </div>
        </template>

        <!-- 尚未登入 -->
        <RouterLink
          v-else
          class="nav-link login-link"
          :to="{
            name: 'login',
          }"
        >
          登入
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* ==================================================
   網站導覽列
   ================================================== */

.site-header {
  position: sticky;
  z-index: 20;
  top: 0;
  background-color:
    rgb(255 255 255 / 92%);
  border-bottom:
    1px solid #cbd5e1;
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

/* ==================================================
   品牌名稱
   ================================================== */

.brand {
  flex-shrink: 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-decoration: none;
}

/* ==================================================
   主要導覽
   ================================================== */

.main-nav {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/*
  導覽連結與登出按鈕的共用樣式
*/
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

/*
  Vue Router 自動加入的目前路由樣式
*/
.nav-link.router-link-active {
  color: #ffffff;
  background-color: #0f766e;
}

/* ==================================================
   登入連結
   ================================================== */

.login-link {
  color: #0f766e;
  border: 1px solid #0f766e;
}

.login-link:hover,
.login-link.router-link-active {
  color: #ffffff;
  background-color: #0f766e;
}

/* ==================================================
   購物車數量
   ================================================== */

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

.nav-link.router-link-active
.cart-count {
  color: #0f172a;
  background-color: #ffffff;
}

/* ==================================================
   管理員專屬導覽入口
   ================================================== */

.admin-nav-link {
  color: #92400e;
  background-color: #fffbeb;
  border: 1px solid #fcd34d;
}

.admin-nav-link:hover {
  color: #78350f;
  background-color: #fef3c7;
}

/*
  第一個選擇器：
  位於後台商品列表時，由 RouterLink 自動加入。

  第二個選擇器：
  位於新增、編輯等其他後台頁面時，
  由 isAdminRoute 手動加入。
*/
.admin-nav-link.router-link-active,
.admin-nav-link.admin-nav-link--active {
  color: #ffffff;
  background-color: #b45309;
  border-color: #b45309;
}

.admin-nav-link:focus-visible {
  outline: 3px solid #fcd34d;
  outline-offset: 3px;
}

/* ==================================================
   使用者操作區
   ================================================== */

.member-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}

/*
  使用者資訊卡片。

  背景使用淺藍綠色漸層，
  可以和導覽列的白色背景清楚區分。
*/
.user-badge {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 7px 12px 7px 8px;
  color: #134e4a;
  background:
    linear-gradient(
      135deg,
      #ecfeff 0%,
      #ccfbf1 100%
    );
  border: 1px solid #5eead4;
  border-radius: 14px;
  box-shadow:
    0 4px 12px
    rgb(15 118 110 / 10%);
}

/*
  管理員使用橘黃色系，
  讓管理員身分更容易辨識。
*/
.user-badge--admin {
  color: #78350f;
  background:
    linear-gradient(
      135deg,
      #fffbeb 0%,
      #fef3c7 100%
    );
  border-color: #fcd34d;
  box-shadow:
    0 4px 12px
    rgb(180 83 9 / 12%);
}

/* ==================================================
   使用者文字頭像
   ================================================== */

.user-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 900;
  line-height: 1;
  background:
    linear-gradient(
      135deg,
      #0f766e,
      #0d9488
    );
  border-radius: 50%;
  box-shadow:
    0 3px 8px
    rgb(15 118 110 / 25%);
}

/* 管理員文字頭像 */
.user-badge--admin
.user-avatar {
  background:
    linear-gradient(
      135deg,
      #b45309,
      #d97706
    );
  box-shadow:
    0 3px 8px
    rgb(180 83 9 / 25%);
}

/* ==================================================
   使用者身分與名稱
   ================================================== */

.user-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.user-role {
  color: #0f766e;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.04em;
}

.user-badge--admin
.user-role {
  color: #b45309;
}

.user-name {
  overflow: hidden;
  max-width: 110px;
  color: inherit;
  font-size: 0.86rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================================================
   登出按鈕
   ================================================== */

.logout-button {
  color: #991b1b;
  background-color: #fff1f2;
  border: 1px solid #fda4af;
  cursor: pointer;
}

.logout-button:hover {
  color: #ffffff;
  background-color: #be123c;
  border-color: #be123c;
  transform: translateY(-2px);
}

/* ==================================================
   鍵盤焦點
   ================================================== */

.nav-link:focus-visible,
.brand:focus-visible,
.logout-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.logout-button:focus-visible {
  outline-color: #fda4af;
}

/* ==================================================
   平板版
   ================================================== */

@media (max-width: 800px) {
  .header-inner {
    flex-wrap: wrap;
    gap: 10px 16px;
    padding: 12px 16px;
  }

  /*
    導覽列占滿第二列。

    當所有選項寬度超過畫面時，
    允許使用者左右捲動。
  */
  .main-nav {
    width: 100%;
    margin-left: 0;
    padding-bottom: 4px;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  /*
    不放大、不縮小，
    寬度由內容決定。
  */
  .nav-link,
  .member-actions {
    flex: 0 0 auto;
  }

  .nav-link {
    white-space: nowrap;
  }
}

/* ==================================================
   手機版
   ================================================== */

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

  .user-badge {
    gap: 7px;
    padding: 6px 9px 6px 6px;
  }

  .user-avatar {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
    font-size: 0.8rem;
  }

  /*
    手機空間較小時隱藏身分文字，
    但保留實際使用者名稱。
  */
  .user-role {
    display: none;
  }

  .user-name {
    max-width: 72px;
    font-size: 0.8rem;
  }

  .cart-count {
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
  }
}

/* ==================================================
   減少動畫偏好
   ================================================== */

@media (
  prefers-reduced-motion:
    reduce
) {
  .nav-link,
  .logout-button {
    transition: none;
  }

  .logout-button:hover {
    transform: none;
  }
}
</style>