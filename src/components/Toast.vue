<script setup>
import { useToastStore } from "../stores/toast.js"

const toastStore = useToastStore()
</script>

<template>
  <div
    class="toast-container"
    aria-live="polite"
  >
    <div
      v-for="message in toastStore.messages"
      :key="message.id"
      class="toast"
      :class="{
        success: message.type === 'success',
        error: message.type === 'error',
      }"
      :role="message.type === 'error' ? 'alert' : 'status'"
    >
      <p class="toast-text">
        {{ message.text }}
      </p>

      <button
        type="button"
        class="toast-button"
        aria-label="關閉通知"
        @click="toastStore.deleteToast(message.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 1000;
  top: 84px;
  right: 20px;
  display: grid;
  width: min(360px, calc(100% - 40px));
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: 12px;
  box-shadow: 0 16px 36px rgb(15 23 42 / 24%);
  pointer-events: auto;
}

.toast.success {
  background-color: #065f46;
  border-color: #047857;
}

.toast.error {
  background-color: #991b1b;
  border-color: #b91c1c;
}

.toast-text {
  flex: 1;
  margin: 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.toast-button {
  display: grid;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  padding: 0;
  place-items: center;
  color: inherit;
  font-size: 1.25rem;
  line-height: 1;
  background-color: rgb(255 255 255 / 14%);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.toast-button:hover {
  background-color: rgb(255 255 255 / 24%);
}

.toast-button:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .toast-container {
    top: 72px;
    right: 16px;
    width: calc(100% - 32px);
  }
}
</style>