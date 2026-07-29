<script setup>
import { computed } from "vue"

import {
  RouterLink,
  useRoute,
} from "vue-router"

import { useOrderStore } from "../stores/order.js"
import { formatPrice } from "../utils/formatPrice.js"

const route = useRoute()
const orderStore = useOrderStore()

const order = computed(() => {
  return orderStore.getOrderById(
    route.params.id,
  )
})

const formatDate = (dateString) => {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat(
    "zh-TW",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date)
}
</script>

<template>
  <main class="success-page">
    <section
      v-if="order"
      class="success-container"
    >
      <header class="success-heading">
        <span
          class="success-icon"
          aria-hidden="true"
        >
          ✓
        </span>

        <p class="success-label">
          ORDER COMPLETED
        </p>

        <h1>訂單建立成功</h1>

        <p class="success-description">
          感謝你的訂購，我們已經收到這筆訂單。
        </p>
      </header>

      <section
        class="order-information"
        aria-labelledby="order-information-title"
      >
        <div class="section-heading">
          <div>
            <p class="section-label">
              ORDER INFORMATION
            </p>

            <h2 id="order-information-title">
              訂單資訊
            </h2>
          </div>

          <span class="order-status">
            {{ order.status }}
          </span>
        </div>

        <dl class="information-grid">
          <div class="information-item">
            <dt>訂單編號</dt>
            <dd>{{ order.id }}</dd>
          </div>

          <div class="information-item">
            <dt>成立時間</dt>
            <dd>{{ formatDate(order.createdAt) }}</dd>
          </div>

          <div class="information-item">
            <dt>收件人</dt>
            <dd>{{ order.customer.name }}</dd>
          </div>

          <div class="information-item">
            <dt>聯絡電話</dt>
            <dd>{{ order.customer.phone }}</dd>
          </div>

          <div class="information-item information-item-full">
            <dt>電子信箱</dt>
            <dd>{{ order.customer.email }}</dd>
          </div>

          <div class="information-item information-item-full">
            <dt>收件地址</dt>
            <dd>{{ order.customer.address }}</dd>
          </div>

          <div
            v-if="order.customer.note"
            class="information-item information-item-full"
          >
            <dt>訂單備註</dt>
            <dd>{{ order.customer.note }}</dd>
          </div>
        </dl>
      </section>

      <section
        class="order-products"
        aria-labelledby="order-products-title"
      >
        <div class="section-heading">
          <div>
            <p class="section-label">
              ORDER ITEMS
            </p>

            <h2 id="order-products-title">
              訂購商品
            </h2>
          </div>

          <span class="quantity-badge">
            {{ order.totalQuantity }} 件
          </span>
        </div>

        <ul class="product-list">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="product-item"
          >
            <div class="product-information">
              <strong>{{ item.name }}</strong>

              <span>
                {{ formatPrice(item.price) }}
                ×
                {{ item.qty }}
              </span>
            </div>

            <strong class="product-subtotal">
              {{ formatPrice(item.price * item.qty) }}
            </strong>
          </li>
        </ul>

        <div class="order-total">
          <span>訂單總金額</span>

          <strong>
            {{ formatPrice(order.totalPrice) }}
          </strong>
        </div>
      </section>

      <div class="success-actions">
        <RouterLink
          :to="{ name: 'home' }"
          class="secondary-link"
        >
          返回首頁
        </RouterLink>

        <RouterLink
          :to="{ name: 'product' }"
          class="primary-link"
        >
          繼續選購
        </RouterLink>
      </div>
    </section>

    <section
      v-else
      class="not-found-card"
    >
      <span
        class="not-found-icon"
        aria-hidden="true"
      >
        !
      </span>

      <h1>找不到這筆訂單</h1>

      <p>
        訂單編號可能不正確，或訂單資料已被移除。
      </p>

      <RouterLink
        :to="{ name: 'product' }"
        class="primary-link"
      >
        返回商品列表
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.success-page {
  min-height: calc(100vh - 72px);
  padding: 64px 20px 80px;
  background:
    radial-gradient(
      circle at top center,
      rgb(204 251 241 / 75%),
      transparent 34%
    ),
    #f8fafc;
}

.success-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.success-heading {
  text-align: center;
}

.success-icon,
.not-found-icon {
  display: grid;
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  place-items: center;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 900;
  border-radius: 50%;
}

.success-icon {
  background-color: #0f766e;
  box-shadow: 0 12px 28px rgb(15 118 110 / 28%);
}

.not-found-icon {
  background-color: #b91c1c;
}

.success-label,
.section-label {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.success-heading h1,
.not-found-card h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.success-description {
  margin: 18px 0 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.order-information,
.order-products,
.not-found-card {
  padding: 32px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  box-shadow: 0 18px 45px rgb(15 23 42 / 10%);
}

.order-information {
  margin-top: 40px;
}

.order-products {
  margin-top: 24px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.section-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.order-status,
.quantity-badge {
  display: inline-grid;
  min-width: 64px;
  min-height: 32px;
  place-items: center;
  padding: 5px 12px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  background-color: #ccfbf1;
  border-radius: 999px;
}

.information-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 28px 0 0;
}

.information-item {
  min-width: 0;
  padding: 18px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.information-item-full {
  grid-column: 1 / -1;
}

.information-item dt {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

.information-item dd {
  margin: 8px 0 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-weight: 800;
  line-height: 1.6;
}

.product-list {
  display: grid;
  gap: 0;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.product-item {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto;
  align-items: start;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;
}

.product-item:first-child {
  padding-top: 0;
}

.product-information {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.product-information strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  line-height: 1.5;
}

.product-information span {
  color: #64748b;
  font-size: 0.9rem;
}

.product-subtotal {
  color: #0f172a;
  white-space: nowrap;
}

.order-total {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
}

.order-total span {
  color: #475569;
  font-weight: 800;
}

.order-total strong {
  color: #0f766e;
  font-size: 1.65rem;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  font-weight: 800;
  text-decoration: none;
  border-radius: 10px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.primary-link {
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
}

.secondary-link {
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.primary-link:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.secondary-link:hover {
  background-color: #f1f5f9;
  border-color: #475569;
  transform: translateY(-2px);
}

.primary-link:focus-visible,
.secondary-link:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.not-found-card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.not-found-card p {
  margin: 20px 0 28px;
  color: #475569;
  line-height: 1.8;
}

@media (max-width: 600px) {
  .success-page {
    padding: 48px 16px 64px;
  }

  .order-information,
  .order-products,
  .not-found-card {
    padding: 24px;
  }

  .information-grid {
    grid-template-columns: 1fr;
  }

  .information-item-full {
    grid-column: auto;
  }

  .section-heading {
    align-items: flex-start;
  }

  .success-actions {
    flex-direction: column;
  }

  .primary-link,
  .secondary-link {
    width: 100%;
  }
}
</style>