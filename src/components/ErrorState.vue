<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "資料讀取失敗",
  },

  message: {
    type: String,
    default:
      "目前無法取得資料，請稍後再試。",
  },

  retryText: {
    type: String,
    default: "重新嘗試",
  },

  showRetry: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  "retry",
])

const handleRetry = () => {
  emit("retry")
}
</script>

<template>
  <section
    class="error-state"
    role="alert"
  >
    <div
      class="error-icon"
      aria-hidden="true"
    >
      !
    </div>

    <h2>{{ props.title }}</h2>

    <p>{{ props.message }}</p>

    <button
      v-if="props.showRetry"
      type="button"
      class="retry-button"
      @click="handleRetry"
    >
      {{ props.retryText }}
    </button>
  </section>
</template>

<style scoped>
.error-state {
  display: grid;
  width: min(100%, 640px);
  justify-items: center;
  gap: 12px;
  margin: 40px auto 0;
  padding: 64px 24px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #fca5a5;
  border-radius: 24px;
  box-shadow:
    0 16px 40px rgb(127 29 29 / 10%);
}

.error-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 8px;
  place-items: center;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 900;
  background-color: #dc2626;
  border-radius: 50%;
}

.error-state h2 {
  margin: 0;
  color: #991b1b;
  font-size: 1.6rem;
}

.error-state p {
  max-width: 460px;
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.retry-button {
  min-height: 44px;
  margin-top: 12px;
  padding: 10px 20px;
  color: #ffffff;
  font: inherit;
  font-weight: 900;
  background-color: #b91c1c;
  border: 1px solid #b91c1c;
  border-radius: 11px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.retry-button:hover {
  background-color: #991b1b;
  border-color: #991b1b;
  transform: translateY(-2px);
}

.retry-button:focus-visible {
  outline: 3px solid #fca5a5;
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .error-state {
    padding: 48px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .retry-button {
    transition: none;
  }

  .retry-button:hover {
    transform: none;
  }
}
</style>