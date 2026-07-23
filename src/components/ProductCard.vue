<script setup>
import { formatPrice } from "../utils/formatPrice.js"

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const getStockText = (stock) => {
  if (stock <= 0) {
    return "已售完"
  }

  if (stock <= 5) {
    return `僅剩 ${stock} 件`
  }

  return `庫存 ${stock} 件`
}

const emits = defineEmits(["add-to-cart"])

const handleAddToCart = (product)=>{
  if(product.stock <= 0){
    return;
  }

  emits("add-to-cart",product)
}
</script>

<template>
  <li class="product-item">
    <img
      :src="product.image"
      alt=""
      class="product-icon"
      aria-hidden="true"
    >

    <div class="product-content">
      <p class="product-category">
        {{ product.category }}
      </p>

      <h3>{{ product.name }}</h3>

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
            'product-stock--sold-out': product.stock <= 0,
            'product-stock--low':
              product.stock > 0 && product.stock <= 5,
            'product-stock--available': product.stock > 5,
          }"
        >
          {{ getStockText(product.stock) }}
        </span>
      </div>

      <button 
        :disabled="product.stock <= 0" 
        @click="handleAddToCart(product)"
        class="add-cart-button"
      >
        {{ product.stock <= 0? "已售完" : "購買" }}
      </button>
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

.product-icon {
  display: grid;
  width: 100%;
  aspect-ratio: 16 / 9;
  place-items: center;
  font-size: 3.5rem;
  background:
    linear-gradient(
      135deg,
      #ccfbf1 0%,
      #e0e7ff 100%
    );
  border-radius: 16px;
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
  color: #0f172a;
  font-size: 1.25rem;
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

.add-cart-button {
  width: 100%;
  margin-top:10px;
  min-height: 44px;
  padding: 12px 20px;
  color: #ffffff;
  font-weight: 800;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.add-cart-button:hover:not(:disabled) {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

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

  .product-icon {
    font-size: 3rem;
  }

  .product-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>