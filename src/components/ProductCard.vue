<script setup>
import { RouterLink } from "vue-router"

import { formatPrice } from "../utils/formatPrice.js"

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  "add-to-cart",
])

const getStockText = (stock) => {
  if (stock <= 0) {
    return "已售完"
  }

  if (stock <= 5) {
    return `僅剩 ${stock} 件`
  }

  return `庫存 ${stock} 件`
}

const handleAddToCart = (product) => {
  if (product.stock <= 0) {
    return
  }

  emit("add-to-cart", product)
}
</script>

<template>
  <li class="product-item">
    <RouterLink
      :to="{
        name: 'product-detail',
        params: {
          id: product.id,
        },
      }"
      class="product-image-link"
      :aria-label="`查看 ${product.name} 的詳細資料`"
    >
      <img
        :src="product.image"
        :alt="product.name"
        class="product-icon"
      />
    </RouterLink>

    <div class="product-content">
      <p class="product-category">
        {{ product.category }}
      </p>

      <h3>
        {{ product.name }}
      </h3>

      <p class="product-description">
        {{ product.description }}
      </p>

      <div class="product-meta">
        <span class="product-price">
          {{ formatPrice(product.price) }}
        </span>

        <span
          class="product-stock"
          :class="{
            'product-stock--sold-out':
              product.stock <= 0,

            'product-stock--low':
              product.stock > 0 &&
              product.stock <= 5,

            'product-stock--available':
              product.stock > 5,
          }"
        >
          {{ getStockText(product.stock) }}
        </span>
      </div>

      <div class="product-actions">
        <RouterLink
          :to="{
            name: 'product-detail',
            params: {
              id: product.id,
            },
          }"
          class="detail-button"
        >
          查看詳情
        </RouterLink>

        <button
          type="button"
          class="add-cart-button"
          :disabled="product.stock <= 0"
          @click="handleAddToCart(product)"
        >
          {{
            product.stock <= 0
              ? "已售完"
              : "加入購物車"
          }}
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.product-item {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 8%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.product-item:hover {
  border-color: #5eead4;
  box-shadow: 0 20px 42px rgb(15 23 42 / 14%);
  transform: translateY(-4px);
}

/* 商品圖片連結 */
.product-image-link {
  display: block;
  overflow: hidden;
  border-radius: 16px;
}

.product-image-link:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.product-icon {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background:
    linear-gradient(
      135deg,
      #ccfbf1 0%,
      #e0e7ff 100%
    );
  transition:
    transform 0.3s ease,
    filter 0.3s ease;
}

/* 滑鼠移到圖片連結時，稍微放大圖片 */
.product-image-link:hover .product-icon {
  filter: saturate(1.08);
  transform: scale(1.04);
}

.product-content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.product-category {
  margin: 0;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 800;
}

.product-content h3 {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.4;
}

.product-description {
  flex: 1;
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.7;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.product-price {
  color: #0f766e;
  font-size: 1.15rem;
  font-weight: 800;
  white-space: nowrap;
}

.product-stock {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 6px 10px;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1;
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
}

.product-stock--available {
  color: #166534;
  background-color: #dcfce7;
  border-color: #86efac;
}

.product-stock--low {
  color: #92400e;
  background-color: #fef3c7;
  border-color: #fcd34d;
}

.product-stock--sold-out {
  color: #991b1b;
  background-color: #fee2e2;
  border-color: #fca5a5;
}

/* 查看詳情與加入購物車 */
.product-actions {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.detail-button,
.add-cart-button {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 11px 14px;
  font: inherit;
  font-weight: 800;
  text-align: center;
  text-decoration: none;
  border-radius: 11px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.detail-button {
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.detail-button:hover {
  color: #0f766e;
  background-color: #f0fdfa;
  border-color: #0f766e;
  transform: translateY(-2px);
}

.add-cart-button {
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  cursor: pointer;
}

.add-cart-button:hover:not(:disabled) {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.detail-button:focus-visible,
.add-cart-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.add-cart-button:disabled {
  color: #475569;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .product-item {
    gap: 16px;
    padding: 20px;
  }

  .product-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .product-actions {
    grid-template-columns: 1fr;
  }
}
</style>