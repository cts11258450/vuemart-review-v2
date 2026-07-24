<script setup>
    
</script>

<template>
  <main class="cart-page">
    <section class="cart-panel">
      <p class="cart-label">SHOPPING CART</p>

      <h1>我的購物車</h1>

      <p class="cart-description">
        購物車功能即將完成，之後加入的商品會顯示在這裡。
      </p>
    </section>
  </main>
</template>

<style scoped>
.cart-page {
  display: grid;
  min-height: 70vh;
  place-items: center;
  padding: 48px 20px;
  background-color: #f8fafc;
}

.cart-panel {
  width: min(100%, 640px);
  padding: 48px 40px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgb(15 23 42 / 10%);
}

.cart-label {
  margin: 0 0 12px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.cart-panel h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 6vw, 3.5rem);
  line-height: 1.2;
}

.cart-description {
  max-width: 480px;
  margin: 20px auto 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.8;
}

@media (max-width: 600px) {
  .cart-page {
    padding: 32px 16px;
  }

  .cart-panel {
    padding: 40px 24px;
  }
}
</style>