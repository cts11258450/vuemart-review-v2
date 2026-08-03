<script setup>
import { reactive } from "vue"

import {
  RouterLink,
  useRouter,
} from "vue-router"

import { useAuthStore } from "../stores/auth.js"

import { handleShowToast } from "../utils/toastHelper.js"

const authStore = useAuthStore()
const router = useRouter()

// 表單資料
const registerForm = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
})

// 各欄位的錯誤訊息
const errorMessage = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
})

// 清除上一次的錯誤訊息
const resetErrorMessage = () => {
  errorMessage.name = ""
  errorMessage.email = ""
  errorMessage.password = ""
  errorMessage.confirmPassword = ""
}

// 驗證 Email 格式
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
}

// 驗證整份註冊表單
const validateForm = () => {
  resetErrorMessage()

  const normalizedName =
    registerForm.name.trim()

  const normalizedEmail =
    registerForm.email
      .trim()
      .toLowerCase()

  if (!normalizedName) {
    errorMessage.name =
      "請輸入會員名稱。"
  } else if (normalizedName.length < 2) {
    errorMessage.name =
      "會員名稱至少需要 2 個字。"
  }

  if (!normalizedEmail) {
    errorMessage.email =
      "請輸入電子信箱。"
  } else if (
    !isValidEmail(normalizedEmail)
  ) {
    errorMessage.email =
      "電子信箱格式不正確。"
  }

  if (!registerForm.password) {
    errorMessage.password =
      "請輸入密碼。"
  } else if (
    registerForm.password.length < 6
  ) {
    errorMessage.password =
      "密碼至少需要 6 個字元。"
  }

  if (!registerForm.confirmPassword) {
    errorMessage.confirmPassword =
      "請再次輸入密碼。"
  } else if (
    registerForm.confirmPassword !==
    registerForm.password
  ) {
    errorMessage.confirmPassword =
      "兩次輸入的密碼不一致。"
  }

  return Object.values(
    errorMessage,
  ).every((message) => {
    return message === ""
  })
}

// 處理註冊
const handleRegister = async () => {
  // 避免使用者連續送出
  if (authStore.isRegistering) {
    return
  }

  const isValid = validateForm()

  if (!isValid) {
    handleShowToast({
      success: false,
      message:
        "請檢查註冊資料是否填寫正確。",
    })

    return
  }

  const result =
    await authStore.registerUser({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    })

  handleShowToast(result)

  if (result.success) {
    router.push({
      name: "login",

      query: {
        email: registerForm.email
          .trim()
          .toLowerCase(),
      },
    })
  }
}
</script>

<template>
  <main class="register-page">
    <section
      class="register-layout"
      aria-labelledby="register-title"
    >
      <div class="register-introduction">
        <RouterLink
          class="brand-link"
          :to="{ name: 'home' }"
        >
          VueMart
        </RouterLink>

        <div class="introduction-content">
          <p class="section-label">
            CREATE ACCOUNT
          </p>

          <h1 id="register-title">
            加入 VueMart
          </h1>

          <p class="introduction-text">
            建立會員帳號，保存你的訂單並享受完整的購物流程。
          </p>

          <ul class="benefit-list">
            <li>
              <span
                class="benefit-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <span>查看個人歷史訂單</span>
            </li>

            <li>
              <span
                class="benefit-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <span>保護個人訂單資料</span>
            </li>

            <li>
              <span
                class="benefit-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <span>體驗完整會員流程</span>
            </li>
          </ul>
        </div>

        <p class="security-notice">
          此專案為前端學習作品，會員資料目前保存於瀏覽器。
        </p>
      </div>

      <div class="register-card">
        <header class="card-heading">
          <p class="card-label">
            會員註冊
          </p>

          <h2>建立新帳號</h2>

          <p>
            請填寫以下資料完成註冊。
          </p>
        </header>

        <form
          class="register-form"
          novalidate
          @submit.prevent="handleRegister"
        >
          <div class="form-group">
            <label for="register-name">
              會員名稱
            </label>

            <input
              id="register-name"
              v-model="registerForm.name"
              type="text"
              name="name"
              autocomplete="name"
              placeholder="請輸入會員名稱"
              :disabled="
                authStore.isRegistering
              "
              :class="{
                'form-control--error':
                  errorMessage.name,
              }"
              :aria-invalid="
                Boolean(errorMessage.name)
              "
              aria-describedby="name-error"
            >

            <p
              v-if="errorMessage.name"
              id="name-error"
              class="error-message"
            >
              {{ errorMessage.name }}
            </p>
          </div>

          <div class="form-group">
            <label for="register-email">
              電子信箱
            </label>

            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="example@email.com"
              :disabled="
                authStore.isRegistering
              "
              :class="{
                'form-control--error':
                  errorMessage.email,
              }"
              :aria-invalid="
                Boolean(errorMessage.email)
              "
              aria-describedby="email-error"
            >

            <p
              v-if="errorMessage.email"
              id="email-error"
              class="error-message"
            >
              {{ errorMessage.email }}
            </p>
          </div>

          <div class="password-layout">
            <div class="form-group">
              <label for="register-password">
                密碼
              </label>

              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                name="password"
                autocomplete="new-password"
                placeholder="至少 6 個字元"
                :disabled="
                  authStore.isRegistering
                "
                :class="{
                  'form-control--error':
                    errorMessage.password,
                }"
                :aria-invalid="
                  Boolean(
                    errorMessage.password,
                  )
                "
                aria-describedby="password-error"
              >

              <p
                v-if="errorMessage.password"
                id="password-error"
                class="error-message"
              >
                {{ errorMessage.password }}
              </p>
            </div>

            <div class="form-group">
              <label for="confirm-password">
                確認密碼
              </label>

              <input
                id="confirm-password"
                v-model="
                  registerForm.confirmPassword
                "
                type="password"
                name="confirmPassword"
                autocomplete="new-password"
                placeholder="再次輸入密碼"
                :disabled="
                  authStore.isRegistering
                "
                :class="{
                  'form-control--error':
                    errorMessage.confirmPassword,
                }"
                :aria-invalid="
                  Boolean(
                    errorMessage.confirmPassword,
                  )
                "
                aria-describedby="confirm-password-error"
              >

              <p
                v-if="
                  errorMessage.confirmPassword
                "
                id="confirm-password-error"
                class="error-message"
              >
                {{
                  errorMessage.confirmPassword
                }}
              </p>
            </div>
          </div>

          <p class="password-hint">
            密碼至少需要 6 個字元，並且兩次輸入必須一致。
          </p>

          <button
            class="register-button"
            type="submit"
            :disabled="
              authStore.isRegistering
            "
          >
            <span
              v-if="authStore.isRegistering"
              class="loading-spinner"
              aria-hidden="true"
            ></span>

            {{
              authStore.isRegistering
                ? "註冊中..."
                : "建立會員帳號"
            }}
          </button>

          <p
            class="loading-message"
            aria-live="polite"
          >
            {{
              authStore.isRegistering
                ? "正在建立會員資料，請稍候。"
                : ""
            }}
          </p>
        </form>

        <p class="login-prompt">
          已經有會員帳號？

          <RouterLink
            :to="{ name: 'login' }"
          >
            前往登入
          </RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.register-page {
  display: grid;
  min-height: calc(100vh - 72px);
  padding: 56px 20px;
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

.register-layout {
  display: grid;
  width: min(100%, 1080px);
  grid-template-columns:
    minmax(300px, 0.9fr)
    minmax(0, 1.1fr);
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 28px;
  box-shadow:
    0 28px 70px rgb(15 23 42 / 14%);
}

.register-introduction {
  display: flex;
  min-height: 660px;
  flex-direction: column;
  padding: 56px 48px;
  color: #ffffff;
  background:
    linear-gradient(
      145deg,
      rgb(15 118 110 / 96%),
      rgb(15 23 42 / 98%)
    );
}

.brand-link {
  align-self: flex-start;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.introduction-content {
  margin: auto 0;
}

.section-label {
  margin: 0 0 12px;
  color: #99f6e4;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.register-introduction h1 {
  margin: 0;
  font-size: clamp(
    2.7rem,
    6vw,
    4.4rem
  );
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.introduction-text {
  max-width: 420px;
  margin: 20px 0 0;
  color: #dbeafe;
  font-size: 1.05rem;
  line-height: 1.8;
}

.benefit-list {
  display: grid;
  gap: 14px;
  margin: 36px 0 0;
  padding: 0;
  list-style: none;
}

.benefit-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f8fafc;
  font-weight: 700;
}

.benefit-icon {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  color: #134e4a;
  font-size: 0.85rem;
  font-weight: 900;
  background-color: #99f6e4;
  border-radius: 50%;
}

.security-notice {
  margin: 32px 0 0;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.6;
}

.register-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 52px 48px;
}

.card-heading {
  margin-bottom: 30px;
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.password-layout {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.form-group {
  display: flex;
  min-width: 0;
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
  box-shadow:
    0 0 0 4px rgb(45 212 191 / 22%);
}

.form-group input.form-control--error {
  background-color: #fef2f2;
  border-color: #dc2626;
}

.form-group input.form-control--error:focus {
  box-shadow:
    0 0 0 4px rgb(248 113 113 / 20%);
}

.form-group input:disabled {
  color: #64748b;
  background-color: #f1f5f9;
  cursor: not-allowed;
}

.error-message {
  margin: 0;
  color: #b91c1c;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.5;
}

.password-hint {
  margin: -4px 0 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.6;
}

.register-button {
  display: inline-flex;
  width: 100%;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

.register-button:hover:not(:disabled) {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.register-button:disabled {
  background-color: #64748b;
  border-color: #64748b;
  cursor: wait;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border:
    2px solid rgb(255 255 255 / 35%);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation:
    loading-rotate 0.8s linear infinite;
}

.loading-message {
  min-height: 20px;
  margin: -10px 0 0;
  color: #64748b;
  font-size: 0.82rem;
  text-align: center;
}

.login-prompt {
  margin: 24px 0 0;
  color: #64748b;
  text-align: center;
}

.login-prompt a {
  color: #0f766e;
  font-weight: 900;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.brand-link:focus-visible,
.register-button:focus-visible,
.login-prompt a:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 880px) {
  .register-layout {
    max-width: 620px;
    grid-template-columns: 1fr;
  }

  .register-introduction {
    min-height: auto;
    padding: 40px 36px;
  }

  .introduction-content {
    margin: 44px 0;
  }

  .security-notice {
    margin-top: 0;
  }

  .register-card {
    padding: 44px 36px;
  }
}

@media (max-width: 560px) {
  .register-page {
    padding: 32px 16px;
    place-items: start center;
  }

  .register-layout {
    border-radius: 20px;
  }

  .register-introduction,
  .register-card {
    padding: 32px 24px;
  }

  .introduction-content {
    margin: 36px 0;
  }

  .password-layout {
    grid-template-columns: 1fr;
  }

  .register-introduction h1 {
    font-size: 2.6rem;
  }

  .card-heading h2 {
    font-size: 1.7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-group input,
  .register-button {
    transition: none;
  }

  .register-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.6s;
  }
}
</style>