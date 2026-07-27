<script setup>
import { RouterLink } from "vue-router"

import { useCartStore } from "../stores/cart.js"

import { formatPrice } from "../utils/formatPrice.js"
import { handleShowToast } from "../utils/toastHelper.js"

const cartStore = useCartStore()

const handleUpdateQty = (id, change) => {
  const result = cartStore.updateCartItemQty(id, change)

  handleShowToast(result)
}

const handleDeleteCartItem = (id) => {
  const result = cartStore.deleteCartItem(id)

  handleShowToast(result)
}

const handleClearCart = ()=>{
  const shouldClear = window.confirm("確定清空購物車嗎?");
  if(!shouldClear){
    return;
  }
  const result = cartStore.clearCart();
  handleShowToast(result);
}
</script>

<template>
  <main class="cart-page">
    <header class="page-heading">
      <p class="page-label">
        SHOPPING CART
      </p>

      <h1>我的購物車</h1>

      <p class="page-description">
        確認商品、數量與金額後，再繼續完成結帳。
      </p>
    </header>

    <!-- 空購物車 -->
    <section
      v-if="cartStore.cart.length === 0"
      class="empty-cart"
    >
      <p
        class="empty-icon"
        aria-hidden="true"
      >
        🛒
      </p>

      <h2>購物車目前是空的</h2>

      <p>
        回到首頁挑選喜歡的商品，再加入購物車吧！
      </p>

      <RouterLink
        class="continue-link"
        :to="{ name: 'home' }"
      >
        繼續選購
      </RouterLink>
    </section>

    <!-- 有商品的購物車 -->
    <div
      v-else
      class="cart-layout"
    >
      <section
        class="cart-list-panel"
        aria-labelledby="cart-list-title"
      >
        <div class="cart-list-heading">
          <h2 id="cart-list-title">
            商品清單
          </h2>

          <button
            type="button"
            class="clear-button"
            @click="handleClearCart"
          >
            清空購物車
          </button>
        </div>

        <ul class="cart-list">
          <li
            v-for="cartItem in cartStore.cart"
            :key="cartItem.id"
            class="cart-item"
          >
            <!-- 商品資訊 -->
            <div class="item-info">
              <p class="item-label">
                商品
              </p>

              <h3>
                {{ cartItem.name }}
              </h3>

              <p class="item-meta">
                單價 {{ formatPrice(cartItem.price) }}
                ・庫存 {{ cartItem.stock }}
              </p>
            </div>

            <!-- 數量控制 -->
            <div
              class="quantity-controls"
              :aria-label="`${cartItem.name}的購買數量`"
            >
              <button
                type="button"
                class="qty-button"
                :aria-label="`減少一件${cartItem.name}`"
                @click="handleUpdateQty(cartItem.id, -1)"
              >
                −
              </button>

              <strong aria-live="polite">
                {{ cartItem.qty }}
              </strong>

              <button
                type="button"
                class="qty-button"
                :aria-label="`增加一件${cartItem.name}`"
                :disabled="cartItem.qty >= cartItem.stock"
                @click="handleUpdateQty(cartItem.id, 1)"
              >
                ＋
              </button>
            </div>

            <!-- 小計與刪除 -->
            <div class="item-actions">
              <p class="item-subtotal">
                {{ formatPrice(cartItem.price * cartItem.qty) }}
              </p>

              <button
                type="button"
                class="delete-button"
                :aria-label="`移除${cartItem.name}`"
                @click="handleDeleteCartItem(cartItem.id)"
              >
                移除
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 訂單摘要 -->
      <aside class="order-summary">
        <p class="summary-label">
          ORDER SUMMARY
        </p>

        <h2>訂單摘要</h2>

        <dl class="summary-list">
          <div class="summary-row">
            <dt>商品種類</dt>

            <dd>
              {{ cartStore.cart.length }}
            </dd>
          </div>

          <div class="summary-row">
            <dt>商品總件數</dt>

            <dd>
              {{ cartStore.totalQuantity }}
            </dd>
          </div>

          <div class="summary-row total-row">
            <dt>合計</dt>

            <dd>
              {{ formatPrice(cartStore.totalPrice) }}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          class="checkout-button"
        >
          前往結帳
        </button>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.cart-page {
  width: min(100%, 1120px);
  min-height: 70vh;
  margin: 0 auto;
  padding: 64px 20px 80px;
}

.page-heading {
  max-width: 680px;
  margin: 0 auto 40px;
  text-align: center;
}

.page-label,
.summary-label,
.item-label {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.4rem, 7vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.page-description {
  margin: 20px 0 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

/* 空購物車 */
.empty-cart {
  max-width: 640px;
  margin: 0 auto;
  padding: 56px 32px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgb(15 23 42 / 10%);
}

.empty-icon {
  margin: 0;
  font-size: 3rem;
}

.empty-cart h2 {
  margin: 20px 0 0;
  color: #0f172a;
  font-size: 1.75rem;
}

.empty-cart p:not(.empty-icon) {
  margin: 12px 0 0;
  color: #475569;
  line-height: 1.7;
}

.continue-link {
  display: inline-flex;
  margin-top: 28px;
  padding: 12px 20px;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
  background-color: #0f766e;
  border-radius: 10px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.continue-link:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.continue-link:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 4px;
}

/* 購物車主要雙欄版面 */
.cart-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 320px;
  align-items: start;
  gap: 24px;
}

.cart-list-panel,
.order-summary {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgb(15 23 42 / 8%);
}

.cart-list-panel {
  padding: 28px;
}

.cart-list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.clear-button {
  flex: 0 0 auto;
  padding: 8px 12px;
  color: #991b1b;
  font-weight: 800;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.clear-button:hover {
  color: #ffffff;
  background-color: #991b1b;
  border-color: #991b1b;
}

.clear-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.cart-list-panel h2,
.order-summary h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.4rem;
}

/* 商品列表 */
.cart-list {
  display: grid;
  gap: 16px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.cart-item {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 24px;
  padding: 20px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.item-label {
  margin-bottom: 6px;
}

.item-info h3 {
  margin: 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 1.1rem;
}

.item-meta {
  margin: 8px 0 0;
  color: #475569;
  font-size: 0.9rem;
}

/* 數量控制 */
.quantity-controls {
  display: grid;
  grid-template-columns:
    32px minmax(28px, auto) 32px;
  align-items: center;
  gap: 6px;
}

.quantity-controls strong {
  color: #0f172a;
  font-size: 1rem;
  text-align: center;
}

.qty-button {
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.qty-button:hover:not(:disabled) {
  color: #ffffff;
  background-color: #0f766e;
  border-color: #0f766e;
}

.qty-button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

/* 商品小計與移除 */
.item-actions {
  display: grid;
  min-width: 112px;
  justify-items: end;
  gap: 8px;
}

.item-subtotal {
  margin: 0;
  color: #0f172a;
  font-weight: 900;
  text-align: right;
}

.delete-button {
  padding: 6px 10px;
  color: #991b1b;
  font-weight: 800;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.delete-button:hover {
  color: #ffffff;
  background-color: #991b1b;
  border-color: #991b1b;
}

.qty-button:focus-visible,
.delete-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

/* 訂單摘要 */
.order-summary {
  position: sticky;
  top: 96px;
  padding: 28px;
}

.summary-label {
  margin-bottom: 8px;
}

.summary-list {
  display: grid;
  gap: 16px;
  margin: 24px 0 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.summary-row dt {
  color: #475569;
}

.summary-row dd {
  margin: 0;
  color: #0f172a;
  font-weight: 800;
}

.total-row {
  padding-top: 18px;
  border-top: 1px solid #cbd5e1;
}

.total-row dt,
.total-row dd {
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 900;
}

.checkout-button {
  width: 100%;
  margin-top: 28px;
  padding: 14px 20px;
  color: #ffffff;
  font-weight: 800;
  background-color: #0f766e;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.checkout-button:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.checkout-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 4px;
}

/* 平板版 */
@media (max-width: 800px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

/* 手機版 */
@media (max-width: 600px) {
  .cart-page {
    padding: 48px 16px 64px;
  }

  .cart-list-panel {
    padding: 20px;
  }

  .cart-item {
    grid-template-columns: 1fr auto;
    gap: 16px;
  }

  .item-actions {
    grid-column: 1 / -1;
    grid-template-columns: 1fr auto;
    width: 100%;
    align-items: center;
    padding-top: 14px;
    border-top: 1px solid #cbd5e1;
  }

  .item-subtotal {
    text-align: left;
  }

  .empty-cart {
    padding: 44px 24px;
  }

  .cart-list-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .clear-button {
    width: 100%;
  }
}
</style>