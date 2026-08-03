<script setup>
import { computed } from "vue"
import {
  RouterLink,
  useRoute,
} from "vue-router"

import { useAuthStore } from "../stores/auth.js"
import { useOrderStore } from "../stores/order.js"

import { formatPrice } from "../utils/formatPrice.js"
import { formatDate } from "../utils/formatDate.js"

const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()

// 根據網址參數尋找訂單
const foundOrder = computed(() => {
  return orderStore.getOrderById(
    route.params.id,
  )
})

// 統一 Email 格式
const normalizeEmail = (email) => {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : ""
}

// 檢查訂單是否屬於目前登入會員
const isOrderOwner = computed(() => {
  const order = foundOrder.value

  if (!order || !authStore.user) {
    return false
  }

  const currentUserId = String(
    authStore.user.id ?? "",
  )

  const orderUserId = String(
    order.userId ?? "",
  )

  const currentUserEmail = normalizeEmail(
    authStore.user.email,
  )

  const customerEmail = normalizeEmail(
    order.customer?.email,
  )

  const matchedUserId =
    currentUserId !== "" &&
    orderUserId === currentUserId

  // 相容尚未加入 userId 前建立的舊訂單
  const matchedEmail =
    currentUserEmail !== "" &&
    customerEmail === currentUserEmail

  return matchedUserId || matchedEmail
})

// 只有訂單存在且屬於目前會員時才提供給畫面
const order = computed(() => {
  if (!isOrderOwner.value) {
    return null
  }

  return foundOrder.value
})

// 相容沒有 totalQuantity 的舊訂單
const orderQuantity = computed(() => {
  if (!order.value) {
    return 0
  }

  if (
    typeof order.value.totalQuantity ===
    "number"
  ) {
    return order.value.totalQuantity
  }

  if (!Array.isArray(order.value.items)) {
    return 0
  }

  return order.value.items.reduce(
    (total, item) => {
      return total + Number(item.qty || 0)
    },
    0,
  )
})

// 計算單項商品小計
const getItemSubtotal = (item) => {
  const price = Number(item.price || 0)
  const quantity = Number(item.qty || 0)

  return price * quantity
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
  <main class="order-detail-page">
    <section
      v-if="order"
      class="order-detail-section"
      aria-labelledby="order-title"
    >
      <nav
        class="breadcrumb"
        aria-label="麵包屑導覽"
      >
        <RouterLink :to="{ name: 'orders' }">
          我的訂單
        </RouterLink>

        <span aria-hidden="true">/</span>

        <span>訂單詳情</span>
      </nav>

      <header class="page-heading">
        <div>
          <p class="section-label">
            ORDER DETAIL
          </p>

          <h1 id="order-title">
            訂單 #{{ order.id }}
          </h1>

          <p class="created-time">
            建立於
            {{ formatDate(order.createdAt) }}
          </p>
        </div>

        <span
          class="order-status"
          :class="getStatusClass(order.status)"
        >
          {{ order.status || "處理中" }}
        </span>
      </header>

      <div class="detail-layout">
        <div class="main-content">
          <section
            class="detail-card"
            aria-labelledby="items-title"
          >
            <header class="card-heading">
              <div>
                <p class="card-label">
                  ORDER ITEMS
                </p>

                <h2 id="items-title">
                  訂單商品
                </h2>
              </div>

              <span class="quantity-badge">
                共 {{ orderQuantity }} 件
              </span>
            </header>

            <ul class="item-list">
              <li
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
              >
                <RouterLink
                  class="item-image-link"
                  :to="{
                    name: 'product-detail',
                    params: {
                      id: item.id,
                    },
                  }"
                >
                  <img
                    class="item-image"
                    :src="item.image"
                    :alt="item.name"
                  >
                </RouterLink>

                <div class="item-information">
                  <p class="item-category">
                    {{ item.category }}
                  </p>

                  <RouterLink
                    class="item-name"
                    :to="{
                      name: 'product-detail',
                      params: {
                        id: item.id,
                      },
                    }"
                  >
                    {{ item.name }}
                  </RouterLink>

                  <p class="item-unit-price">
                    單價：
                    {{ formatPrice(item.price) }}
                  </p>
                </div>

                <div class="item-calculation">
                  <span>
                    數量 × {{ item.qty }}
                  </span>

                  <strong>
                    {{
                      formatPrice(
                        getItemSubtotal(item),
                      )
                    }}
                  </strong>
                </div>
              </li>
            </ul>
          </section>

          <section
            class="detail-card"
            aria-labelledby="customer-title"
          >
            <header class="card-heading">
              <div>
                <p class="card-label">
                  DELIVERY INFORMATION
                </p>

                <h2 id="customer-title">
                  收件資料
                </h2>
              </div>
            </header>

            <dl class="customer-information">
              <div class="information-item">
                <dt>收件人</dt>

                <dd>
                  {{
                    order.customer?.name ||
                    "未提供"
                  }}
                </dd>
              </div>

              <div class="information-item">
                <dt>電子信箱</dt>

                <dd>
                  {{
                    order.customer?.email ||
                    "未提供"
                  }}
                </dd>
              </div>

              <div class="information-item">
                <dt>聯絡電話</dt>

                <dd>
                  {{
                    order.customer?.phone ||
                    "未提供"
                  }}
                </dd>
              </div>

              <div class="information-item information-item--full">
                <dt>收件地址</dt>

                <dd>
                  {{
                    order.customer?.address ||
                    "未提供"
                  }}
                </dd>
              </div>

              <div class="information-item information-item--full">
                <dt>訂單備註</dt>

                <dd class="order-note">
                  {{
                    order.customer?.note ||
                    "沒有填寫備註"
                  }}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside
          class="summary-card"
          aria-labelledby="summary-title"
        >
          <p class="card-label">
            SUMMARY
          </p>

          <h2 id="summary-title">
            訂單摘要
          </h2>

          <dl class="summary-list">
            <div>
              <dt>商品種類</dt>

              <dd>
                {{ order.items?.length || 0 }} 項
              </dd>
            </div>

            <div>
              <dt>商品總數</dt>

              <dd>{{ orderQuantity }} 件</dd>
            </div>

            <div>
              <dt>訂單狀態</dt>

              <dd>
                {{ order.status || "處理中" }}
              </dd>
            </div>
          </dl>

          <div class="total-price">
            <span>訂單總金額</span>

            <strong>
              {{ formatPrice(order.totalPrice) }}
            </strong>
          </div>

          <RouterLink
            class="back-button"
            :to="{ name: 'orders' }"
          >
            返回我的訂單
          </RouterLink>
        </aside>
      </div>
    </section>

    <section
      v-else
      class="not-found-state"
      aria-labelledby="not-found-title"
    >
      <div
        class="not-found-icon"
        aria-hidden="true"
      >
        🔒
      </div>

      <p class="section-label">
        ORDER NOT FOUND
      </p>

      <h1 id="not-found-title">
        找不到這筆訂單
      </h1>

      <p>
        訂單可能不存在，或你沒有權限查看這筆訂單。
      </p>

      <RouterLink
        class="back-button"
        :to="{ name: 'orders' }"
      >
        返回我的訂單
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.order-detail-page {
  min-height: calc(100vh - 72px);
  padding: 56px 20px 80px;
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

.order-detail-section {
  width: min(100%, 1120px);
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: #64748b;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: #0f766e;
  font-weight: 800;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.section-label,
.card-label {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.page-heading h1 {
  margin: 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 3.3rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.created-time {
  margin: 14px 0 0;
  color: #64748b;
}

.order-status {
  display: inline-flex;
  min-height: 34px;
  flex-shrink: 0;
  align-items: center;
  padding: 7px 14px;
  font-size: 0.88rem;
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

.detail-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(280px, 340px);
  align-items: start;
  gap: 28px;
}

.main-content {
  display: grid;
  min-width: 0;
  gap: 28px;
}

.detail-card,
.summary-card {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 8%);
}

.detail-card {
  padding: 28px;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.card-heading h2,
.summary-card h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.45rem;
}

.quantity-badge {
  flex-shrink: 0;
  padding: 7px 12px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  background-color: #ccfbf1;
  border-radius: 999px;
}

.item-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.order-item {
  display: grid;
  grid-template-columns:
    112px
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
}

.order-item:first-child {
  padding-top: 0;
  border-top: 0;
}

.order-item:last-child {
  padding-bottom: 0;
}

.item-image-link {
  display: block;
  overflow: hidden;
  border-radius: 12px;
}

.item-image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background-color: #e2e8f0;
  transition: transform 0.25s ease;
}

.item-image-link:hover .item-image {
  transform: scale(1.05);
}

.item-information {
  min-width: 0;
}

.item-category {
  margin: 0;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 800;
}

.item-name {
  display: inline-block;
  margin-top: 6px;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 900;
  text-decoration: none;
}

.item-name:hover {
  color: #0f766e;
}

.item-unit-price {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.item-calculation {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  text-align: right;
}

.item-calculation span {
  color: #64748b;
  font-size: 0.85rem;
}

.item-calculation strong {
  color: #0f766e;
  font-size: 1.05rem;
}

.customer-information {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin: 0;
}

.information-item {
  min-width: 0;
}

.information-item--full {
  grid-column: 1 / -1;
}

.information-item dt {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
}

.information-item dd {
  margin: 7px 0 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-weight: 700;
  line-height: 1.65;
}

.order-note {
  padding: 14px 16px;
  color: #475569;
  background-color: #f8fafc;
  border-radius: 12px;
}

.summary-card {
  position: sticky;
  top: 100px;
  padding: 28px;
}

.summary-list {
  display: grid;
  gap: 16px;
  margin: 24px 0 0;
}

.summary-list > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.summary-list dt {
  color: #64748b;
}

.summary-list dd {
  margin: 0;
  color: #0f172a;
  font-weight: 800;
  text-align: right;
}

.total-price {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid #cbd5e1;
}

.total-price span {
  color: #64748b;
  font-size: 0.9rem;
}

.total-price strong {
  color: #0f766e;
  font-size: 1.65rem;
}

.back-button {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 12px 20px;
  color: #ffffff;
  font-weight: 900;
  text-decoration: none;
  background-color: #0f766e;
  border-radius: 12px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.back-button:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.back-button:focus-visible,
.breadcrumb a:focus-visible,
.item-image-link:focus-visible,
.item-name:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.not-found-state {
  width: min(100%, 640px);
  margin: 40px auto;
  padding: 64px 32px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgb(15 23 42 / 10%);
}

.not-found-icon {
  margin-bottom: 20px;
  font-size: 4rem;
}

.not-found-state h1 {
  margin: 0;
  color: #0f172a;
  font-size: 2rem;
}

.not-found-state > p:not(.section-label) {
  margin: 16px 0 0;
  color: #475569;
  line-height: 1.8;
}

.not-found-state .back-button {
  width: auto;
}

@media (max-width: 850px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 620px) {
  .order-detail-page {
    padding: 40px 16px 64px;
  }

  .page-heading {
    flex-direction: column;
  }

  .detail-card,
  .summary-card {
    padding: 22px 18px;
  }

  .order-item {
    grid-template-columns:
      88px
      minmax(0, 1fr);
  }

  .item-calculation {
    grid-column: 1 / -1;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px dashed #cbd5e1;
  }

  .customer-information {
    grid-template-columns: 1fr;
  }

  .information-item--full {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .item-image,
  .back-button {
    transition: none;
  }

  .item-image-link:hover .item-image,
  .back-button:hover {
    transform: none;
  }
}
</style>