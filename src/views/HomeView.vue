<script setup>
import { ref } from "vue"
import { RouterLink } from "vue-router"

const shopName = "VueMart"

const welcomeMessage = ref(
  "從零開始，重新完成一個 Vue 3 電商專案。",
)

const handleStart = () => {
  welcomeMessage.value =
    "準備完成！現在可以前往商品列表挑選商品。"
}
</script>

<template>
  <main class="home-page">
    <section class="hero-section">
      <p class="eyebrow">
        Vue 3 電商專案複習
      </p>

      <h1>{{ shopName }}</h1>

      <p class="description">
        {{ welcomeMessage }}
      </p>

      <div class="hero-actions">
        <button
          type="button"
          class="start-button"
          @click="handleStart"
        >
          開始學習
        </button>

        <RouterLink
          to="/product"
          class="product-link"
        >
          瀏覽商品
        </RouterLink>
      </div>
    </section>

    <section class="learning-section">
      <p class="section-label">
        PROJECT PRACTICE
      </p>

      <h2>從基礎一路完成購物流程</h2>

      <div class="learning-grid">
        <article class="learning-card">
          <span class="card-number">01</span>
          <h3>Vue 元件</h3>
          <p>
            使用 props、emit 與響應式資料建立可重複使用的商品元件。
          </p>
        </article>

        <article class="learning-card">
          <span class="card-number">02</span>
          <h3>狀態管理</h3>
          <p>
            使用 Pinia 集中管理商品、購物車與畫面通知。
          </p>
        </article>

        <article class="learning-card">
          <span class="card-number">03</span>
          <h3>完整流程</h3>
          <p>
            練習商品瀏覽、加入購物車、填寫資料與建立訂單。
          </p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  min-height: calc(100vh - 72px);
  flex-direction: column;
  align-items: center;
  gap: 72px;
  padding: 72px 20px;
  background:
    radial-gradient(
      circle at top left,
      rgb(204 251 241 / 70%),
      transparent 36%
    ),
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.hero-section {
  width: 100%;
  max-width: 760px;
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
  font-size: 0.9rem;
  font-weight: 900;
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

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.start-button,
.product-link {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  font-weight: 800;
  text-decoration: none;
  border-radius: 12px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.start-button {
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  cursor: pointer;
}

.product-link {
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.start-button:hover {
  background-color: #115e59;
  transform: translateY(-2px);
}

.product-link:hover {
  background-color: #f1f5f9;
  border-color: #475569;
  transform: translateY(-2px);
}

.start-button:focus-visible,
.product-link:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 4px;
}

.learning-section {
  width: 100%;
  max-width: 960px;
  text-align: center;
}

.learning-section h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  line-height: 1.2;
}

.learning-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 32px;
  text-align: left;
}

.learning-card {
  padding: 28px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  box-shadow: 0 14px 36px rgb(15 23 42 / 8%);
}

.card-number {
  display: inline-grid;
  width: 42px;
  height: 42px;
  place-items: center;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 900;
  background-color: #0f766e;
  border-radius: 50%;
}

.learning-card h3 {
  margin: 20px 0 0;
  color: #0f172a;
  font-size: 1.2rem;
}

.learning-card p {
  margin: 12px 0 0;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 760px) {
  .learning-grid {
    grid-template-columns: 1fr;
  }
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

  .hero-actions {
    flex-direction: column;
  }

  .start-button,
  .product-link {
    width: 100%;
  }
}
</style>