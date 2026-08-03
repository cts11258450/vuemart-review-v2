<script setup>
defineProps({
  title: {
    type: String,
    default: "目前沒有資料",
  },

  message: {
    type: String,
    default:
      "目前沒有符合條件的資料。",
  },
})
</script>

<template>
  <section class="empty-state">
    <div
      class="empty-icon"
      aria-hidden="true"
    >
      <slot name="icon">
        📭
      </slot>
    </div>

    <h2>{{ title }}</h2>

    <p>{{ message }}</p>

    <div
      v-if="$slots.action"
      class="empty-action"
    >
      <slot name="action"></slot>
    </div>
  </section>
</template>

<style scoped>
.empty-state {
  display: grid;
  width: min(100%, 640px);
  justify-items: center;
  gap: 12px;
  margin: 40px auto 0;
  padding: 64px 24px;
  text-align: center;
  background-color: #ffffff;
  border: 1px dashed #94a3b8;
  border-radius: 24px;
}

.empty-icon {
  margin-bottom: 8px;
  font-size: 4rem;
  line-height: 1;
}

.empty-state h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.7rem;
}

.empty-state p {
  max-width: 460px;
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.empty-action {
  margin-top: 12px;
}

@media (max-width: 560px) {
  .empty-state {
    padding: 48px 20px;
  }
}
</style>