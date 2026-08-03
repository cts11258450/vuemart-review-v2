<script setup>
import EmptyState from "../components/EmptyState.vue"

import { computed } from "vue"
import { RouterLink } from "vue-router"

import { useAuthStore } from "../stores/auth.js"
import { useOrderStore } from "../stores/order.js"

import { formatPrice } from "../utils/formatPrice.js"
import { formatDate } from "../utils/formatDate.js"

const authStore = useAuthStore()
const orderStore = useOrderStore()

// 將 Email 統一轉成小寫並移除頭尾空白
const normalizeEmail = (email) => {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : ""
}

// 取得目前登入會員的訂單
const memberOrders = computed(() => {
  const currentUserId = String(
    authStore.user?.id ?? "",
  )

  const currentUserEmail = normalizeEmail(
    authStore.user?.email,
  )

  return orderStore.orders.filter((order) => {
    const orderUserId = String(
      order.userId ?? "",
    )

    const customerEmail = normalizeEmail(
      order.customer?.email,
    )

    // 新訂單使用 userId 判斷
    const matchedUserId =
      currentUserId !== "" &&
      orderUserId === currentUserId

    // 相容尚未加入 userId 前建立的舊訂單
    const matchedEmail =
      currentUserEmail !== "" &&
      customerEmail === currentUserEmail

    return matchedUserId || matchedEmail
  })
})

// 相容早期沒有 totalQuantity 的舊訂單
const getOrderQuantity = (order) => {
  if (
    typeof order.totalQuantity === "number"
  ) {
    return order.totalQuantity
  }

  if (!Array.isArray(order.items)) {
    return 0
  }

  return order.items.reduce(
    (total, item) => {
      return total + Number(item.qty || 0)
    },
    0,
  )
}

// 顯示訂單商品摘要
const getItemSummary = (items) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return "沒有商品資料"
  }

  const itemNames = items
    .slice(0, 2)
    .map((item) => {
      return item.name
    })
    .join("、")

  const remainingCount = items.length - 2

  if (remainingCount > 0) {
    return `${itemNames}，以及其他 ${remainingCount} 項商品`
  }

  return itemNames
}

// 根據訂單狀態回傳 CSS class
const getStatusClass = (status) => {
  if (status === "已完成") {
    return "order-status--completed"
  }

  if (status === "已取消") {
    return "order-status--cancelled"
  }

  return "order-status--processing"
}
</script>

<template>
  <main class="orders-page">
    <section
      class="orders-section"
      aria-labelledby="orders-title"
    >
      <header class="page-heading">
        <p class="section-label">
          ORDER HISTORY
        </p>

        <h1 id="orders-title">
          我的訂單
        </h1>

        <p class="page-description">
          查看你在 VueMart 建立的歷史訂單。
        </p>

        <p class="order-summary">
          目前共有
          <strong>{{ memberOrders.length }}</strong>
          筆訂單
        </p>
      </header>

      <EmptyState
        v-if="memberOrders.length === 0"
        title="目前還沒有訂單"
        message="前往商品列表，挑選適合你的桌面裝備吧！"
      >
        <template #icon>
          📦
        </template>

        <template #action>
          <RouterLink
            class="product-link"
            :to="{ name: 'product' }"
          >
            前往商品列表
          </RouterLink>
        </template>
      </EmptyState>

      <ul
        v-else
        class="order-list"
      >
        <li
          v-for="order in memberOrders"
          :key="order.id"
          class="order-card"
        >
          <header class="order-header">
            <div>
              <p class="order-label">
                訂單編號
              </p>

              <h2 class="order-id">
                #{{ order.id }}
              </h2>
            </div>

            <span
              class="order-status"
              :class="
                getStatusClass(order.status)
              "
            >
              {{ order.status || "處理中" }}
            </span>
          </header>

          <dl class="order-information">
            <div class="information-item">
              <dt>建立時間</dt>

              <dd>
                {{ formatDate(order.createdAt) }}
              </dd>
            </div>

            <div class="information-item">
              <dt>收件人</dt>

              <dd>
                {{ order.customer?.name || "未提供" }}
              </dd>
            </div>

            <div class="information-item">
              <dt>商品數量</dt>

              <dd>
                {{ getOrderQuantity(order) }} 件
              </dd>
            </div>
          </dl>

          <div class="item-summary">
            <p class="item-summary-label">
              訂單商品
            </p>

            <p>
              {{ getItemSummary(order.items) }}
            </p>
          </div>

          <footer class="order-footer">
            <div class="order-total">
              <span>訂單金額</span>

              <strong>
                {{ formatPrice(order.totalPrice) }}
              </strong>
            </div>

            <RouterLink
            class="detail-link"
            :to="{
              name: 'order-detail',
              params: {
                id: order.id,
              },
            }"
          >
            查看訂單詳情
          </RouterLink>
          </footer>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.orders-page {
  min-height: calc(100vh - 72px);
  padding: 64px 20px 80px;
  background:
    radial-gradient(
      circle at top left,
      rgb(204 251 241 / 65%),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.orders-section {
  width: min(100%, 960px);
  margin: 0 auto;
}

.page-heading {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}

.section-label {
  margin: 0 0 12px;
  color: #0f766e;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.4rem, 6vw, 4rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
}

.page-description {
  margin: 18px 0 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.order-summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 24px 0 0;
  padding: 9px 16px;
  color: #334155;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
}

.order-summary strong {
  color: #0f766e;
  font-size: 1.1rem;
}

.order-list {
  display: grid;
  gap: 24px;
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
}

.order-card {
  padding: 28px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 8%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.order-card:hover {
  border-color: #5eead4;
  box-shadow: 0 20px 44px rgb(15 23 42 / 13%);
  transform: translateY(-3px);
}

.order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.order-label {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
}

.order-id {
  margin: 6px 0 0;
  color: #0f172a;
  font-size: 1.25rem;
  overflow-wrap: anywhere;
}

.order-status {
  display: inline-flex;
  min-height: 32px;
  flex-shrink: 0;
  align-items: center;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 900;
  border: 1px solid transparent;
  border-radius: 999px;
}

.order-status--processing {
  color: #92400e;
  background-color: #fef3c7;
  border-color: #fcd34d;
}

.order-status--completed {
  color: #166534;
  background-color: #dcfce7;
  border-color: #86efac;
}

.order-status--cancelled {
  color: #991b1b;
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.order-information {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0 0;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 14px;
}

.information-item {
  min-width: 0;
}

.information-item dt {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.information-item dd {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-weight: 800;
}

.item-summary {
  margin-top: 20px;
}

.item-summary-label {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
}

.item-summary > p:last-child {
  margin: 7px 0 0;
  color: #334155;
  line-height: 1.7;
}

.order-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-total span {
  color: #64748b;
  font-size: 0.85rem;
}

.order-total strong {
  color: #0f766e;
  font-size: 1.35rem;
}

.detail-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  color: #0f766e;
  font-weight: 800;
  text-decoration: none;
  background-color: #f0fdfa;
  border: 1px solid #5eead4;
  border-radius: 10px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.detail-link:hover {
  color: #ffffff;
  background-color: #0f766e;
  transform: translateY(-2px);
}

.detail-link:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.product-link {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 12px 22px;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
  background-color: #0f766e;
  border-radius: 12px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.product-link:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.product-link:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .orders-page {
    padding: 48px 16px 64px;
  }

  .order-information {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .order-card {
    padding: 22px 18px;
  }

  .order-header,
  .order-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .order-card,
  .product-link {
    transition: none;
  }

  .order-card:hover,
  .product-link:hover {
    transform: none;
  }
}
</style>