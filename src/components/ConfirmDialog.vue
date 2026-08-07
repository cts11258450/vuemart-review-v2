<script setup>
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue"

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: "確認操作",
  },

  message: {
    type: String,
    default: "",
  },

  confirmText: {
    type: String,
    default: "確認",
  },

  cancelText: {
    type: String,
    default: "取消",
  },

  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  "confirm",
  "cancel",
])

// 取消按鈕 DOM
const cancelButton = ref(null)

// 記錄開啟對話框前取得焦點的元素
let previousActiveElement = null

// ==================================================
// 操作
// ==================================================

const handleConfirm = () => {
  if (props.isLoading) {
    return
  }

  emit("confirm")
}

const handleCancel = () => {
  if (props.isLoading) {
    return
  }

  emit("cancel")
}

// ==================================================
// 鍵盤控制
// ==================================================

const handleKeydown = (event) => {
  if (
    !props.open ||
    props.isLoading
  ) {
    return
  }

  if (event.key === "Escape") {
    handleCancel()
  }
}

// ==================================================
// 焦點管理
// ==================================================

watch(
  () => props.open,

  async (isOpen) => {
    if (isOpen) {
      // 記錄原本取得焦點的按鈕
      previousActiveElement =
        document.activeElement

      // 等待對話框真正渲染完成
      await nextTick()

      // 將焦點放到取消按鈕。
      // 刪除是危險操作，因此預設不聚焦確認。
      cancelButton.value?.focus()

      return
    }

    // 關閉後將焦點還給原本的元素
    previousActiveElement?.focus?.()
    previousActiveElement = null
  },
)

// ==================================================
// 元件生命週期
// ==================================================

onMounted(() => {
  window.addEventListener(
    "keydown",
    handleKeydown,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    "keydown",
    handleKeydown,
  )
})
</script>

<template>
  <!--
    Teleport 只改變實際 DOM 的掛載位置，
    不會破壞 Props、Emit 或元件關係。
  -->
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="open"
        class="dialog-overlay"
        @click.self="handleCancel"
      >
        <section
          class="dialog-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
        >
          <span
            class="warning-icon"
            aria-hidden="true"
          >
            !
          </span>

          <div class="dialog-content">
            <h2 id="confirm-dialog-title">
              {{ title }}
            </h2>

            <p id="confirm-dialog-message">
              {{ message }}
            </p>
          </div>

          <div class="dialog-actions">
            <button
              ref="cancelButton"
              type="button"
              class="cancel-button"
              :disabled="isLoading"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>

            <button
              type="button"
              class="confirm-button"
              :disabled="isLoading"
              @click="handleConfirm"
            >
              <span
                v-if="isLoading"
                class="button-spinner"
                aria-hidden="true"
              ></span>

              {{
                isLoading
                  ? "處理中..."
                  : confirmText
              }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background-color:
    rgb(15 23 42 / 68%);
  backdrop-filter: blur(5px);
}

.dialog-card {
  width: min(100%, 480px);
  padding: 32px;
  background-color: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 22px;
  box-shadow:
    0 28px 80px
    rgb(15 23 42 / 35%);
}

.warning-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 20px;
  place-items: center;
  color: #991b1b;
  font-size: 1.75rem;
  font-weight: 900;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 50%;
}

.dialog-content h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.55rem;
}

.dialog-content p {
  margin: 14px 0 0;
  color: #475569;
  line-height: 1.75;
  white-space: pre-line;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #e2e8f0;
}

.cancel-button,
.confirm-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font: inherit;
  font-weight: 800;
  border-radius: 11px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.cancel-button {
  color: #334155;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.cancel-button:hover:not(:disabled) {
  color: #0f172a;
  background-color: #f1f5f9;
}

.confirm-button {
  gap: 8px;
  color: #ffffff;
  background-color: #b91c1c;
  border: 1px solid #b91c1c;
}

.confirm-button:hover:not(:disabled) {
  background-color: #991b1b;
  border-color: #991b1b;
  transform: translateY(-2px);
}

.cancel-button:focus-visible {
  outline: 3px solid #94a3b8;
  outline-offset: 3px;
}

.confirm-button:focus-visible {
  outline: 3px solid #fca5a5;
  outline-offset: 3px;
}

.cancel-button:disabled,
.confirm-button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: wait;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid
    rgb(255 255 255 / 45%);
  border-top-color: currentColor;
  border-radius: 50%;
  animation:
    dialog-spin
    0.7s
    linear
    infinite;
}

/* 對話框進入與離開動畫 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-active
  .dialog-card,
.dialog-fade-leave-active
  .dialog-card {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from
  .dialog-card,
.dialog-fade-leave-to
  .dialog-card {
  opacity: 0;
  transform:
    translateY(12px)
    scale(0.97);
}

@keyframes dialog-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .dialog-card {
    padding: 26px 20px;
    border-radius: 18px;
  }

  .dialog-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
  }
}
</style>