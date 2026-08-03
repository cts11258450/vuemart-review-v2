<script setup>
import {
  reactive,
  watch,
} from "vue"

import {
  RouterLink,
  useRouter,
  useRoute,
} from "vue-router"

import { useAuthStore } from "../stores/auth.js"
import { handleShowToast } from "../utils/toastHelper.js"

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 允許出現在登入頁的 Query 欄位
const allowedQueryKeys = [
  "email",
  "redirect",
]

// 驗證 Email 格式
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
}

// 統一 Email 格式
const normalizeEmail = (email) => {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : ""
}

// 將 Query Email 轉成安全格式
const getSafeEmail = (value) => {
  const normalizedEmail =
    normalizeEmail(value)

  return isValidEmail(normalizedEmail)
    ? normalizedEmail
    : ""
}

// 將 Redirect 轉成安全的站內路徑
const getSafeRedirect = (value) => {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value
  }

  return ""
}

// 根據目前網址建立乾淨的 Query
const getSafeQueryFromRoute = () => {
  const safeQuery = {}

  const safeEmail = getSafeEmail(
    route.query.email,
  )

  const safeRedirect = getSafeRedirect(
    route.query.redirect,
  )

  if (safeEmail) {
    safeQuery.email = safeEmail
  }

  if (safeRedirect) {
    safeQuery.redirect = safeRedirect
  }

  return safeQuery
}

// 檢查兩份 Query 是否相同
const isSameQuery = (
  queryA,
  queryB,
) => {
  const queryAKeys =
    Object.keys(queryA)

  const queryBKeys =
    Object.keys(queryB)

  // 欄位數量不同，代表兩份 Query 不相同
  if (
    queryAKeys.length !==
    queryBKeys.length
  ) {
    return false
  }

  return queryAKeys.every((key) => {
    return (
      allowedQueryKeys.includes(key) &&
      queryA[key] === queryB[key]
    )
  })
}

// 表單資料
const loginForm = reactive({
  email: getSafeEmail(
    route.query.email,
  ),

  password: "",
})

// 欄位錯誤訊息
const errorMessage = reactive({
  email: "",
  password: "",
})

// 清除上一次的錯誤訊息
const resetErrorMessage = () => {
  errorMessage.email = ""
  errorMessage.password = ""
}

// 驗證登入表單
const validateForm = () => {
  resetErrorMessage()

  const email = normalizeEmail(
    loginForm.email,
  )

  if (!email) {
    errorMessage.email =
      "請輸入電子信箱。"
  } else if (!isValidEmail(email)) {
    errorMessage.email =
      "電子信箱格式不正確。"
  }

  if (!loginForm.password) {
    errorMessage.password =
      "請輸入密碼。"
  } else if (
    loginForm.password.length < 6
  ) {
    errorMessage.password =
      "密碼至少需要 6 個字元。"
  }

  return Object.values(
    errorMessage,
  ).every((message) => {
    return message === ""
  })
}

// 處理登入
const handleLogin = async () => {
  if (authStore.isLoading) {
    return
  }

  const isValid = validateForm()

  if (!isValid) {
    handleShowToast({
      success: false,
      message:
        "請檢查登入資料是否正確。",
    })

    return
  }

  const result =
    await authStore.loginUser({
      email: loginForm.email,
      password: loginForm.password,
    })

  handleShowToast(result)

  if (result.success) {
    const redirectPath =
      getSafeRedirect(
        route.query.redirect,
      ) || "/"

    router.replace(redirectPath)
  }
}

// Query 改變時：
// 1. 清除不合法欄位
// 2. 保留合法 Email 與 Redirect
// 3. 將安全 Email 同步到表單
watch(
  () => route.query,

  () => {
    const safeQuery =
      getSafeQueryFromRoute()

    // 網址不乾淨時，先修正網址
    if (
      !isSameQuery(
        route.query,
        safeQuery,
      )
    ) {
      router.replace({
        query: safeQuery,
      })

      return
    }

    // 網址已經乾淨，才同步表單
    loginForm.email =
      safeQuery.email || ""

    errorMessage.email = ""
  },

  {
    immediate: true,
  },
)
</script>

<template>
  <main class="login-page">
    <section
      class="login-layout"
      aria-labelledby="login-title"
    >
      <div class="login-introduction">
        <RouterLink
          class="brand-link"
          :to="{ name: 'home' }"
        >
          VueMart
        </RouterLink>

        <p class="section-label">
          MEMBER LOGIN
        </p>

        <h1 id="login-title">
          歡迎回來
        </h1>

        <p class="introduction-text">
          登入會員帳號，繼續你的 VueMart 購物旅程。
        </p>

        <div class="demo-account">
          <p class="demo-title">
            練習用登入資料
          </p>

          <p>
            電子信箱：可輸入任何有效的 Email
          </p>

          <p>
            密碼：
            <strong>123456</strong>
          </p>
        </div>
      </div>

      <div class="login-card">
        <header class="card-heading">
          <p class="card-label">
            會員登入
          </p>

          <h2>登入你的帳號</h2>

          <p>
            請輸入電子信箱與密碼。
          </p>
        </header>

        <form
          class="login-form"
          novalidate
          @submit.prevent="handleLogin"
        >
          <div class="form-group">
            <label for="email">
              電子信箱
            </label>

            <input
              id="email"
              v-model.trim="loginForm.email"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="example@email.com"
              :class="{
                'form-control--error':
                  errorMessage.email,
              }"
              :aria-invalid="
                Boolean(errorMessage.email)
              "
              aria-describedby="email-error"
              :disabled="authStore.isLoading"
            >

            <p
              v-if="errorMessage.email"
              id="email-error"
              class="error-message"
            >
              {{ errorMessage.email }}
            </p>
          </div>

          <div class="form-group">
            <label for="password">
              密碼
            </label>

            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              name="password"
              autocomplete="current-password"
              placeholder="請輸入密碼"
              :class="{
                'form-control--error':
                  errorMessage.password,
              }"
              :aria-invalid="
                Boolean(errorMessage.password)
              "
              aria-describedby="password-error"
              :disabled="authStore.isLoading"
            >

            <p
              v-if="errorMessage.password"
              id="password-error"
              class="error-message"
            >
              {{ errorMessage.password }}
            </p>
          </div>

          <button
            class="login-button"
            type="submit"
            :disabled="authStore.isLoading"
          >
            <span
              v-if="authStore.isLoading"
              class="loading-spinner"
              aria-hidden="true"
            ></span>

            {{
              authStore.isLoading
                ? "登入中..."
                : "登入"
            }}
          </button>
        </form>

        <p class="back-home">
          還不想登入？

          <RouterLink :to="{ name: 'home' }">
            返回首頁
          </RouterLink>
        </p>

        <p class="register-prompt">
          還沒有會員帳號？

          <RouterLink
            :to="{ name: 'register' }"
          >
            免費建立帳號
          </RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: calc(100vh - 72px);
  padding: 64px 20px;
  place-items: center;
  background:
    radial-gradient(
      circle at top left,
      rgb(204 251 241 / 75%),
      transparent 34%
    ),
    radial-gradient(
      circle at bottom right,
      rgb(224 231 255 / 85%),
      transparent 38%
    ),
    #f8fafc;
}

.login-layout {
  display: grid;
  width: min(100%, 1000px);
  grid-template-columns:
    minmax(0, 1fr)
    minmax(360px, 440px);
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 28px;
  box-shadow: 0 28px 70px rgb(15 23 42 / 14%);
}

.login-introduction {
  display: flex;
  min-height: 560px;
  flex-direction: column;
  justify-content: center;
  padding: 64px 56px;
  color: #ffffff;
  background:
    linear-gradient(
      145deg,
      rgb(15 118 110 / 94%),
      rgb(15 23 42 / 96%)
    );
}

.brand-link {
  align-self: flex-start;
  margin-bottom: 64px;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.section-label {
  margin: 0 0 12px;
  color: #99f6e4;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.login-introduction h1 {
  margin: 0;
  font-size: clamp(2.6rem, 6vw, 4.2rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
}

.introduction-text {
  max-width: 440px;
  margin: 20px 0 0;
  color: #dbeafe;
  font-size: 1.05rem;
  line-height: 1.8;
}

.demo-account {
  margin-top: 40px;
  padding: 20px;
  color: #dbeafe;
  background-color: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 16px;
}

.demo-account p {
  margin: 6px 0;
  line-height: 1.6;
}

.demo-account .demo-title {
  margin-top: 0;
  color: #ffffff;
  font-weight: 900;
}

.demo-account strong {
  color: #99f6e4;
}

.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px 44px;
}

.card-heading {
  margin-bottom: 32px;
}

.card-label {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.card-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 2rem;
  letter-spacing: -0.03em;
}

.card-heading > p:last-child {
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #334155;
  font-size: 0.95rem;
  font-weight: 800;
}

.form-group input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  color: #0f172a;
  font: inherit;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 12px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group input:hover:not(:disabled) {
  border-color: #0f766e;
}

.form-group input:focus {
  border-color: #0f766e;
  box-shadow: 0 0 0 4px rgb(45 212 191 / 22%);
}

.form-group input.form-control--error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.form-group input.form-control--error:focus {
  box-shadow: 0 0 0 4px rgb(248 113 113 / 20%);
}

.form-group input:disabled {
  color: #64748b;
  background-color: #f1f5f9;
  cursor: not-allowed;
}

.error-message {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.5;
}

.login-button {
  display: inline-flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
  padding: 12px 24px;
  color: #ffffff;
  font: inherit;
  font-weight: 900;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.login-button:focus-visible,
.brand-link:focus-visible,
.back-home a:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.login-button:disabled {
  background-color: #64748b;
  border-color: #64748b;
  cursor: wait;
  transform: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgb(255 255 255 / 35%);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: loading-rotate 0.8s linear infinite;
}

.back-home {
  margin: 28px 0 0;
  color: #64748b;
  text-align: center;
}

.back-home a {
  color: #0f766e;
  font-weight: 800;
  text-decoration: none;
}

.back-home a:hover {
  text-decoration: underline;
}

.register-prompt {
  margin: 24px 0 0;
  color: #64748b;
  text-align: center;
}

.register-prompt a {
  color: #0f766e;
  font-weight: 900;
  text-decoration: none;
}

.register-prompt a:hover {
  text-decoration: underline;
}

.register-prompt a:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 800px) {
  .login-layout {
    max-width: 560px;
    grid-template-columns: 1fr;
  }

  .login-introduction {
    min-height: auto;
    padding: 40px 32px;
  }

  .brand-link {
    margin-bottom: 36px;
  }

  .demo-account {
    margin-top: 28px;
  }

  .login-card {
    padding: 44px 32px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 32px 16px;
    place-items: start center;
  }

  .login-layout {
    border-radius: 20px;
  }

  .login-introduction,
  .login-card {
    padding: 32px 24px;
  }

  .login-introduction h1 {
    font-size: 2.5rem;
  }

  .card-heading h2 {
    font-size: 1.7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-button {
    transition: none;
  }

  .login-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.6s;
  }
}
</style>