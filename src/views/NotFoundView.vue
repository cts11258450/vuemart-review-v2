<script setup>
import { computed } from "vue"

import {
  RouterLink,
  useRoute,
  useRouter,
} from "vue-router"

const route = useRoute()
const router = useRouter()

// 顯示使用者目前嘗試進入的網址
const attemptedPath = computed(() => {
  return route.fullPath || "/"
})

// 返回瀏覽器上一頁
const handleGoBack = () => {
  router.back()
}
</script>

<template>
  <main class="not-found-page">
    <div
      class="decoration decoration--top"
      aria-hidden="true"
    ></div>

    <div
      class="decoration decoration--bottom"
      aria-hidden="true"
    ></div>

    <section
      class="not-found-card"
      aria-labelledby="not-found-title"
    >
      <p class="status-label">
        PAGE NOT FOUND
      </p>

      <p
        class="error-code"
        aria-hidden="true"
      >
        404
      </p>

      <h1 id="not-found-title">
        找不到這個頁面
      </h1>

      <p class="description">
        這個網址可能不存在、已經被移動，或輸入時發生錯誤。
      </p>

      <div class="attempted-route">
        <span>你嘗試前往：</span>

        <code>{{ attemptedPath }}</code>
      </div>

      <div class="action-list">
        <RouterLink
          class="action-button action-button--primary"
          :to="{ name: 'home' }"
        >
          返回首頁
        </RouterLink>

        <RouterLink
          class="action-button action-button--secondary"
          :to="{ name: 'product' }"
        >
          瀏覽商品
        </RouterLink>

        <button
          type="button"
          class="back-button"
          @click="handleGoBack"
        >
          返回上一頁
        </button>
      </div>

      <p class="help-text">
        如果你是從站內連結來到這裡，請返回首頁後重新操作。
      </p>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  position: relative;
  isolation: isolate;
  display: grid;
  min-height: calc(100vh - 72px);
  overflow: hidden;
  padding: 64px 20px;
  place-items: center;
  background:
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.not-found-card {
  width: min(100%, 680px);
  padding: 56px 48px;
  text-align: center;
  background-color:
    rgb(255 255 255 / 92%);
  border: 1px solid #cbd5e1;
  border-radius: 28px;
  box-shadow:
    0 28px 70px rgb(15 23 42 / 14%);
  backdrop-filter: blur(14px);
}

.status-label {
  margin: 0;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.error-code {
  margin: 14px 0 0;
  color: transparent;
  font-size: clamp(
    6rem,
    22vw,
    10rem
  );
  font-weight: 1000;
  line-height: 0.95;
  letter-spacing: -0.08em;
  background:
    linear-gradient(
      135deg,
      #0f766e,
      #4f46e5
    );
  background-clip: text;
}

.not-found-card h1 {
  margin: 24px 0 0;
  color: #0f172a;
  font-size: clamp(
    2rem,
    6vw,
    3.2rem
  );
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.description {
  max-width: 520px;
  margin: 18px auto 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.attempted-route {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
  padding: 14px 18px;
  color: #475569;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}

.attempted-route span {
  flex-shrink: 0;
  font-size: 0.9rem;
}

.attempted-route code {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #b91c1c;
  font-family:
    "Cascadia Code",
    "Consolas",
    monospace;
  font-size: 0.9rem;
  font-weight: 800;
}

.action-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.action-button,
.back-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  font: inherit;
  font-weight: 900;
  border-radius: 12px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.action-button {
  text-decoration: none;
}

.action-button--primary {
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
}

.action-button--primary:hover {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.action-button--secondary {
  color: #0f766e;
  background-color: #f0fdfa;
  border: 1px solid #5eead4;
}

.action-button--secondary:hover {
  color: #ffffff;
  background-color: #0f766e;
  border-color: #0f766e;
  transform: translateY(-2px);
}

.back-button {
  color: #334155;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.back-button:hover {
  color: #0f172a;
  background-color: #f1f5f9;
  border-color: #64748b;
  transform: translateY(-2px);
}

.action-button:focus-visible,
.back-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.help-text {
  margin: 28px 0 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.7;
}

.decoration {
  position: absolute;
  z-index: -1;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.7;
}

.decoration--top {
  top: -180px;
  left: -120px;
  background:
    radial-gradient(
      circle,
      #99f6e4 0%,
      rgb(153 246 228 / 0%) 70%
    );
}

.decoration--bottom {
  right: -140px;
  bottom: -190px;
  background:
    radial-gradient(
      circle,
      #c7d2fe 0%,
      rgb(199 210 254 / 0%) 70%
    );
}

@media (max-width: 560px) {
  .not-found-page {
    padding: 40px 16px;
  }

  .not-found-card {
    padding: 44px 24px;
    border-radius: 20px;
  }

  .attempted-route {
    align-items: flex-start;
    flex-direction: column;
    text-align: left;
  }

  .action-list {
    flex-direction: column;
  }

  .action-button,
  .back-button {
    width: 100%;
  }

  .decoration {
    width: 280px;
    height: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-button,
  .back-button {
    transition: none;
  }

  .action-button:hover,
  .back-button:hover {
    transform: none;
  }
}
</style>