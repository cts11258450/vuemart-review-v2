<script setup>
import { RouterView } from "vue-router"

import SiteHeader from "./components/SiteHeader.vue"
</script>

<template>
  <div class="app-shell">
    <SiteHeader />

    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>