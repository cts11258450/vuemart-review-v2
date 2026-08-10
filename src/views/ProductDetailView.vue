<script setup>
import { computed } from "vue"

import {
  RouterLink,
  useRoute,
} from "vue-router"

import { useProductStore } from "../stores/product.js"
import { useCartStore } from "../stores/cart.js"

import { formatPrice } from "../utils/formatPrice.js"
import { handleShowToast } from "../utils/toastHelper.js"

const route = useRoute()

const productStore = useProductStore()
const cartStore = useCartStore()

// 根據動態路由參數取得商品
const product = computed(() => {
  return productStore.getProductById(
    route.params.id,
  )
})

// 判斷商品是否缺貨
const isOutOfStock = computed(() => {
  if (!product.value) {
    return true
  }

  return product.value.stock <= 0
})

// 將商品加入購物車
const handleAddToCart = () => {
  if (!product.value) {
    return
  }

  const result =
    cartStore.addToCart(product.value)

  handleShowToast(result)
}
</script>

<template>
  <main class="detail-page">
    <section
      v-if="product"
      class="detail-container"
    >
      <RouterLink
        :to="{ name: 'product' }"
        class="back-link"
      >
        ← 返回商品列表
      </RouterLink>

      <div class="detail-layout">
        <!-- 商品圖片區 -->
        <div class="product-visual">
          <img
            :src="product.image"
            :alt="product.name"
            class="product-image"
          >

          <!-- 圖片右下角的商品分類 -->
          <p class="visual-category">
            {{ product.category }}
          </p>
        </div>

        <!-- 商品資料區 -->
        <article class="product-information">
          <p class="product-category">
            {{ product.category }}
          </p>

          <h1>{{ product.name }}</h1>

          <p class="product-description">
            {{ product.description }}
          </p>

          <div class="product-price">
            {{ formatPrice(product.price) }}
          </div>

          <dl class="product-meta">
            <div class="meta-item">
              <dt>商品編號</dt>

              <dd>
                #{{ product.id }}
              </dd>
            </div>

            <div class="meta-item">
              <dt>商品分類</dt>

              <dd>
                {{ product.category }}
              </dd>
            </div>

            <div class="meta-item meta-item-full">
              <dt>庫存狀態</dt>

              <dd
                class="stock-status"
                :class="{
                  'in-stock': !isOutOfStock,
                  'out-of-stock': isOutOfStock,
                }"
              >
                <template v-if="isOutOfStock">
                  商品目前缺貨
                </template>

                <template v-else>
                  尚有 {{ product.stock }} 件
                </template>
              </dd>
            </div>
          </dl>

          <div class="purchase-panel">
            <div>
              <span class="purchase-label">
                購買價格
              </span>

              <strong>
                {{ formatPrice(product.price) }}
              </strong>
            </div>

            <button
              type="button"
              class="cart-button"
              :disabled="isOutOfStock"
              @click="handleAddToCart"
            >
              {{
                isOutOfStock
                  ? "目前缺貨"
                  : "加入購物車"
              }}
            </button>
          </div>

          <p class="purchase-notice">
            本網站為 Vue 3 電商練習專案，不會進行真實付款。
          </p>
        </article>
      </div>
    </section>

    <!-- 找不到商品 -->
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

      <p class="not-found-label">
        PRODUCT NOT FOUND
      </p>

      <h1>找不到這項商品</h1>

      <p>
        商品編號可能不正確，或這項商品已經被移除。
      </p>

      <RouterLink
        :to="{ name: 'product' }"
        class="product-link"
      >
        返回商品列表
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.detail-page {
  min-height: calc(100vh - 72px);
  padding: 56px 20px 80px;
  background:
    radial-gradient(
      circle at top right,
      rgb(204 251 241 / 70%),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.detail-container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  padding: 9px 14px;
  color: #0f172a;
  font-weight: 800;
  text-decoration: none;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.back-link:hover {
  color: #0f766e;
  background-color: #f0fdfa;
  border-color: #0f766e;
}

.back-link:focus-visible,
.product-link:focus-visible,
.cart-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

/* 商品圖片區與資料區的雙欄排版 */
.detail-layout {
  display: grid;
  grid-template-columns:
    minmax(280px, 0.8fr)
    minmax(0, 1.2fr);
  align-items: stretch;
  gap: 32px;
  margin-top: 24px;
}

.product-visual,
.product-information {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 22px;
  box-shadow:
    0 20px 50px rgb(15 23 42 / 10%);
}

/* 商品圖片外層 */
.product-visual {
  position: relative;
  min-height: 480px;
  overflow: hidden;
  background-color: #f8fafc;
}

/*
  商品圖片使用絕對定位填滿外層。

  object-fit: cover：
  保持圖片原始比例，同時填滿整個圖片區域。
  如果圖片比例不同，部分邊緣可能會被裁切。
*/
.product-image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.4s ease,
    filter 0.4s ease;
}

/* 滑鼠移入圖片區時，稍微放大圖片 */
.product-visual:hover .product-image {
  filter: saturate(1.08);
  transform: scale(1.04);
}

/* 圖片右下角的分類標籤 */
.visual-category {
  position: absolute;
  right: 20px;
  bottom: 20px;
  margin: 0;
  padding: 8px 14px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  background-color:
    rgb(15 23 42 / 82%);
  border:
    1px solid rgb(255 255 255 / 45%);
  border-radius: 999px;
  box-shadow:
    0 8px 20px rgb(15 23 42 / 20%);
  backdrop-filter: blur(8px);
}

.product-information {
  padding: 40px;
}

.product-category {
  margin: 0;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.product-information h1 {
  margin: 14px 0 0;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.product-description {
  margin: 22px 0 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.product-price {
  margin-top: 28px;
  color: #0f766e;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 900;
}

.product-meta {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 30px 0 0;
}

.meta-item {
  min-width: 0;
  padding: 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.meta-item-full {
  grid-column: 1 / -1;
}

.meta-item dt {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.meta-item dd {
  margin: 7px 0 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-weight: 800;
}

.stock-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.stock-status::before {
  width: 9px;
  height: 9px;
  background-color: currentcolor;
  border-radius: 50%;
  content: "";
}

.in-stock {
  color: #047857;
}

.out-of-stock {
  color: #b91c1c;
}

.purchase-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 30px;
  padding-top: 26px;
  border-top: 1px solid #e2e8f0;
}

.purchase-panel > div {
  display: grid;
  gap: 7px;
}

.purchase-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

.purchase-panel strong {
  color: #0f172a;
  font-size: 1.5rem;
}

.cart-button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  color: #ffffff;
  font-weight: 800;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.cart-button:hover:not(:disabled) {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.cart-button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.85;
}

.purchase-notice {
  margin: 18px 0 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.6;
}

/* 找不到商品 */
.not-found-card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 32px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 22px;
  box-shadow:
    0 20px 50px rgb(15 23 42 / 10%);
}

.not-found-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto 22px;
  place-items: center;
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 900;
  background-color: #b91c1c;
  border-radius: 50%;
}

.not-found-label {
  margin: 0;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.not-found-card h1 {
  margin: 12px 0 0;
  color: #0f172a;
  font-size: clamp(2rem, 5vw, 3rem);
}

.not-found-card > p:last-of-type {
  margin: 18px 0 28px;
  color: #475569;
  line-height: 1.8;
}

.product-link {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
  background-color: #0f766e;
  border-radius: 10px;
}

.product-link:hover {
  background-color: #115e59;
}

/* 平板版 */
@media (max-width: 800px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .product-visual {
    min-height: 320px;
  }
}

/* 手機版 */
@media (max-width: 600px) {
  .detail-page {
    padding: 40px 16px 64px;
  }

  .product-information {
    padding: 28px 24px;
  }

  .product-visual {
    min-height: 280px;
  }

  .visual-category {
    right: 14px;
    bottom: 14px;
    padding: 7px 12px;
    font-size: 0.82rem;
  }

  .product-meta {
    grid-template-columns: 1fr;
  }

  .meta-item-full {
    grid-column: auto;
  }

  .purchase-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .cart-button {
    width: 100%;
  }

  .not-found-card {
    padding: 40px 24px;
  }
}
</style>