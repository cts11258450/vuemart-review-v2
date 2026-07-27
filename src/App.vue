<script setup>
import { RouterView } from "vue-router"
import Toast from "./components/Toast.vue";

import SiteHeader from "./components/SiteHeader.vue"
</script>

<template>
  <div class="app-shell">
    <SiteHeader />

    <RouterView />

    <Toast />
  </div>

</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
}
</style>