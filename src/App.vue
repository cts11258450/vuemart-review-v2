<script setup>
import { ref } from "vue"

import ProductCard from "./components/ProductCard.vue"
import { mockProducts } from "./data/mockProducts.js"

const shopName = "VueMart"

const welcomeMessage = ref(
  "從零開始，重新完成一個 Vue 3 電商專案。",
)

const handleStart = () => {
  welcomeMessage.value = "準備完成！接下來開始建立商品功能。"
}

const handleAddToCart = (product)=>{
  console.log(product.name)
}
</script>

<template>
  <main class="home-page">
    <section class="hero-section">
      <p class="eyebrow">Vue 3 電商專案複習</p>

      <h1>{{ shopName }}</h1>

      <p class="description">
        {{ welcomeMessage }}
      </p>

      <button
        type="button"
        class="start-button"
        @click="handleStart"
      >
        開始學習
      </button>
    </section>

    <section
      class="products-section"
      aria-labelledby="products-title"
    >
      <header class="section-heading">
        <p class="section-label">精選商品</p>

        <h2 id="products-title">
          找到適合你的桌面裝備
        </h2>

        <p class="product-summary">
          目前共有 {{ mockProducts.length }} 項商品
        </p>
      </header>

      <ul class="product-list">
        <ProductCard
          v-for="product in mockProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </ul>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  gap: 64px;
  padding: 72px 20px;
  background:
    radial-gradient(
      circle at top left,
      rgb(204 251 241 / 70%),
      transparent 36%
    ),
    linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.hero-section {
  width: 100%;
  max-width: 720px;
  padding: 64px 40px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow: 0 24px 60px rgb(15 23 42 / 12%);
}

.eyebrow,
.section-label {
  margin: 0 0 12px;
  color: #0f766e;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(3rem, 9vw, 5.5rem);
  line-height: 1;
  letter-spacing: -0.05em;
}

.description {
  max-width: 540px;
  margin: 24px auto 0;
  color: #334155;
  font-size: 1.1rem;
  line-height: 1.8;
}

.start-button {
  margin-top: 32px;
  padding: 14px 28px;
  color: #ffffff;
  font-weight: 700;
  background-color: #0f766e;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.start-button:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.start-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 4px;
}

.products-section {
  width: 100%;
  max-width: 960px;
}

.section-heading {
  text-align: center;
}

.section-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  line-height: 1.2;
}

.product-summary {
  margin: 16px 0 0;
  color: #475569;
  font-size: 1rem;
}

.product-list {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}

@media (max-width: 600px) {
  .home-page {
    gap: 48px;
    padding: 48px 16px;
  }

  .hero-section {
    padding: 48px 24px;
  }

  .description {
    font-size: 1rem;
  }
}
</style>