<script setup>
defineProps({
  title: {
    type: String,
    default: "資料載入中",
  },

  message: {
    type: String,
    default:
      "正在取得最新資料，請稍候。",
  },
})
</script>

<template>
  <section
    class="loading-state"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      class="loading-spinner"
      aria-hidden="true"
    ></div>

    <h2>{{ title }}</h2>

    <p>{{ message }}</p>
  </section>
</template>

<style scoped>
.loading-state {
  display: grid;
  width: min(100%, 640px);
  justify-items: center;
  gap: 12px;
  margin: 40px auto 0;
  padding: 64px 24px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow:
    0 16px 40px rgb(15 23 42 / 9%);
}

.loading-spinner {
  position: relative;
  width: 58px;
  height: 58px;
  margin-bottom: 8px;
}

.loading-spinner::before,
.loading-spinner::after {
  position: absolute;
  inset: 0;
  content: "";
  border: 5px solid #ccfbf1;
  border-radius: 50%;
}

.loading-spinner::after {
  border-color: transparent;
  border-top-color: #0f766e;
  border-right-color: #0f766e;
  animation:
    loading-rotate 0.8s linear infinite;
}

.loading-state h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.6rem;
}

.loading-state p {
  max-width: 460px;
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .loading-state {
    padding: 48px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner::after {
    animation-duration: 1.6s;
  }
}
</style>