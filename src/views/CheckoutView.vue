<script setup>
import { reactive } from "vue"
import { RouterLink, useRouter } from "vue-router"

import { useCartStore } from "../stores/cart.js"
import { useOrderStore } from "../stores/order.js"
import { formatPrice } from "../utils/formatPrice.js"
import { handleShowToast } from "../utils/toastHelper.js"

const cartStore = useCartStore()
const orderStore = useOrderStore()
const router = useRouter()

// 表單資料
const checkoutForm = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  note: "",
})

// 各欄位的錯誤訊息
const errorMessage = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  note: "",
})

// 清除上一次驗證留下的錯誤
const resetErrorMessage = () => {
  errorMessage.name = ""
  errorMessage.email = ""
  errorMessage.phone = ""
  errorMessage.address = ""
  errorMessage.note = ""
}

// 驗證 Email 格式
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 驗證台灣手機號碼：09 開頭，共 10 位數字
const isValidPhone = (phone) => {
  return /^09\d{8}$/.test(phone)
}

// 驗證整份表單
const validateForm = () => {
  resetErrorMessage()

  if (checkoutForm.name.length < 2) {
    errorMessage.name = "收件人姓名至少需要 2 個字。"
  }

  if (!checkoutForm.email) {
    errorMessage.email = "請輸入電子信箱。"
  } else if (!isValidEmail(checkoutForm.email)) {
    errorMessage.email = "電子信箱格式不正確。"
  }

  if (!checkoutForm.phone) {
    errorMessage.phone = "請輸入聯絡電話。"
  } else if (!isValidPhone(checkoutForm.phone)) {
    errorMessage.phone = "請輸入以 09 開頭的 10 位手機號碼。"
  }

  if (checkoutForm.address.length < 6) {
    errorMessage.address = "請輸入至少 6 個字的完整收件地址。"
  }

  if (checkoutForm.note.length > 200) {
    errorMessage.note = "訂單備註不可超過 200 個字。"
  }

  return Object.values(errorMessage).every((message) => {
    return message === ""
  })
}

// 處理表單送出
const handleSubmit = () => {
  if (cartStore.cart.length === 0) {
    handleShowToast({
      success: false,
      message: "購物車是空的，無法送出訂單。",
    })

    return
  }

  const isValid = validateForm()

  if (!isValid) {
    handleShowToast({
      success: false,
      message: "請檢查結帳資料是否填寫正確。",
    })

    return
  }

  const orderData = {
    customer: {
      ...checkoutForm,
    },

    items: cartStore.cart.map((item) => {
      return {
        ...item,
      }
    }),

    totalQuantity: cartStore.totalQuantity,
    totalPrice: cartStore.totalPrice,
  }

  const result = orderStore.createOrder(orderData);

  handleShowToast(result);

  if(result.success){
    
    // 訂單已經建立完成，現在才清空購物車
    cartStore.clearCart()

    router.push({
        name:"order-success",
        params:{
            id:result.newOrder.id
        }
    });
  }
}
</script>

<template>
  <main class="checkout-page">
    <div class="checkout-container">
      <header class="checkout-heading">
        <p class="checkout-label">
          CHECKOUT
        </p>

        <h1>填寫結帳資料</h1>

        <p class="checkout-description">
          請確認商品內容，並填寫正確的收件與聯絡資訊。
        </p>
      </header>

      <div class="checkout-layout">
        <form
          class="checkout-form"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <div class="form-heading">
            <div>
              <p class="form-step">
                STEP 1
              </p>

              <h2>收件人資料</h2>
            </div>

            <span class="required-note">
              * 為必填欄位
            </span>
          </div>

          <div class="form-grid">
            <!-- 收件人姓名 -->
            <div class="form-group">
              <label for="name">
                收件人姓名 *
              </label>

              <input
                id="name"
                v-model.trim="checkoutForm.name"
                type="text"
                name="name"
                autocomplete="name"
                placeholder="例如：王小明"
                :class="{
                  'input-error': errorMessage.name,
                }"
                :aria-invalid="Boolean(errorMessage.name)"
                :aria-describedby="
                  errorMessage.name
                    ? 'name-error'
                    : undefined
                "
              />

              <p
                v-if="errorMessage.name"
                id="name-error"
                class="error-message"
                role="alert"
              >
                {{ errorMessage.name }}
              </p>
            </div>

            <!-- 聯絡電話 -->
            <div class="form-group">
              <label for="phone">
                聯絡電話 *
              </label>

              <input
                id="phone"
                v-model.trim="checkoutForm.phone"
                type="tel"
                name="phone"
                autocomplete="tel"
                placeholder="例如：0912345678"
                :class="{
                  'input-error': errorMessage.phone,
                }"
                :aria-invalid="Boolean(errorMessage.phone)"
                :aria-describedby="
                  errorMessage.phone
                    ? 'phone-error'
                    : undefined
                "
              />

              <p
                v-if="errorMessage.phone"
                id="phone-error"
                class="error-message"
                role="alert"
              >
                {{ errorMessage.phone }}
              </p>
            </div>

            <!-- 電子信箱 -->
            <div class="form-group form-group-full">
              <label for="email">
                電子信箱 *
              </label>

              <input
                id="email"
                v-model.trim="checkoutForm.email"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="例如：example@mail.com"
                :class="{
                  'input-error': errorMessage.email,
                }"
                :aria-invalid="Boolean(errorMessage.email)"
                :aria-describedby="
                  errorMessage.email
                    ? 'email-error'
                    : undefined
                "
              />

              <p
                v-if="errorMessage.email"
                id="email-error"
                class="error-message"
                role="alert"
              >
                {{ errorMessage.email }}
              </p>
            </div>

            <!-- 收件地址 -->
            <div class="form-group form-group-full">
              <label for="address">
                收件地址 *
              </label>

              <input
                id="address"
                v-model.trim="checkoutForm.address"
                type="text"
                name="address"
                autocomplete="street-address"
                placeholder="請輸入完整收件地址"
                :class="{
                  'input-error': errorMessage.address,
                }"
                :aria-invalid="Boolean(errorMessage.address)"
                :aria-describedby="
                  errorMessage.address
                    ? 'address-error'
                    : undefined
                "
              />

              <p
                v-if="errorMessage.address"
                id="address-error"
                class="error-message"
                role="alert"
              >
                {{ errorMessage.address }}
              </p>
            </div>

            <!-- 訂單備註 -->
            <div class="form-group form-group-full">
              <label for="note">
                訂單備註
              </label>

              <textarea
                id="note"
                v-model.trim="checkoutForm.note"
                name="note"
                rows="5"
                maxlength="201"
                placeholder="例如：請於平日下午送達"
                :class="{
                  'input-error': errorMessage.note,
                }"
                :aria-invalid="Boolean(errorMessage.note)"
                :aria-describedby="
                  errorMessage.note
                    ? 'note-hint note-error'
                    : 'note-hint'
                "
              ></textarea>

              <div class="field-information">
                <p
                  id="note-hint"
                  class="field-hint"
                >
                  選填，最多 200 個字。
                </p>

                <span
                  class="character-count"
                  :class="{
                    'character-count-error':
                      checkoutForm.note.length > 200,
                  }"
                >
                  {{ checkoutForm.note.length }} / 200
                </span>
              </div>

              <p
                v-if="errorMessage.note"
                id="note-error"
                class="error-message"
                role="alert"
              >
                {{ errorMessage.note }}
              </p>
            </div>
          </div>

          <div class="form-actions">
            <RouterLink
              to="/cart"
              class="back-link"
            >
              返回購物車
            </RouterLink>

            <button
              type="submit"
              class="submit-button"
            >
              確認送出訂單
            </button>
          </div>
        </form>

        <aside class="order-summary">
          <div class="summary-heading">
            <div>
              <p class="form-step">
                STEP 2
              </p>

              <h2>訂單摘要</h2>
            </div>

            <span class="item-count">
              {{ cartStore.totalQuantity }} 件
            </span>
          </div>

          <ul class="summary-list">
            <li
              v-for="item in cartStore.cart"
              :key="item.id"
              class="summary-item"
            >
              <div class="item-information">
                <strong>
                  {{ item.name }}
                </strong>

                <span>
                  {{ formatPrice(item.price) }}
                  ×
                  {{ item.qty }}
                </span>
              </div>

              <strong class="item-price">
                {{ formatPrice(item.price * item.qty) }}
              </strong>
            </li>
          </ul>

          <div class="summary-total">
            <span>訂單總金額</span>

            <strong>
              {{ formatPrice(cartStore.totalPrice) }}
            </strong>
          </div>

          <p class="summary-notice">
            本練習專案不會進行真實付款。
          </p>
        </aside>
      </div>
    </div>
  </main>
</template>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 72px);
  padding: 64px 20px;
  background:
    radial-gradient(
      circle at top right,
      rgb(204 251 241 / 70%),
      transparent 32%
    ),
    #f8fafc;
}

.checkout-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.checkout-heading {
  max-width: 680px;
}

.checkout-label,
.form-step {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.checkout-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 6vw, 3.5rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.checkout-description {
  margin: 20px 0 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

/* 結帳頁主要雙欄排版 */
.checkout-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(280px, 360px);
  align-items: start;
  gap: 32px;
  margin-top: 40px;
}

.checkout-form,
.order-summary {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  box-shadow: 0 18px 45px rgb(15 23 42 / 10%);
}

.checkout-form {
  padding: 32px;
}

.form-heading,
.summary-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.form-heading h2,
.summary-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.required-note {
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 700;
}

/* 表單內部雙欄排版 */
.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.form-group {
  display: grid;
  align-content: start;
  gap: 10px;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-group label {
  color: #0f172a;
  font-weight: 800;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 13px 14px;
  color: #0f172a;
  font: inherit;
  line-height: 1.5;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-group textarea {
  min-height: 130px;
  resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #64748b;
}

.form-group input:hover,
.form-group textarea:hover {
  border-color: #475569;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #0f766e;
  outline: none;
  box-shadow: 0 0 0 4px rgb(20 184 166 / 20%);
}

/* 驗證錯誤狀態 */
.form-group input.input-error,
.form-group textarea.input-error {
  border-color: #b91c1c;
  background-color: #fff7f7;
}

.form-group input.input-error:focus,
.form-group textarea.input-error:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 4px rgb(185 28 28 / 18%);
}

.error-message {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 800;
  line-height: 1.5;
}

.field-information {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.field-hint {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
}

.character-count {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

.character-count-error {
  color: #b91c1c;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.back-link,
.submit-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  font-weight: 800;
  text-decoration: none;
  border-radius: 10px;
}

.back-link {
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.submit-button {
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  cursor: pointer;
}

.back-link:hover {
  background-color: #f1f5f9;
}

.submit-button:hover {
  background-color: #115e59;
}

.back-link:focus-visible,
.submit-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

/* 右側訂單摘要 */
.order-summary {
  position: sticky;
  top: 96px;
  padding: 28px;
}

.item-count {
  display: inline-grid;
  min-width: 48px;
  min-height: 30px;
  place-items: center;
  padding: 4px 10px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  background-color: #ccfbf1;
  border-radius: 999px;
}

.summary-list {
  display: grid;
  gap: 18px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.summary-item {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto;
  align-items: start;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e2e8f0;
}

.item-information {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.item-information strong {
  overflow-wrap: anywhere;
  color: #0f172a;
  line-height: 1.5;
}

.item-information span {
  color: #64748b;
  font-size: 0.9rem;
}

.item-price {
  color: #0f172a;
  white-space: nowrap;
}

.summary-total {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
}

.summary-total span {
  color: #475569;
  font-weight: 700;
}

.summary-total strong {
  color: #0f766e;
  font-size: 1.5rem;
}

.summary-notice {
  margin: 20px 0 0;
  padding: 12px;
  color: #334155;
  font-size: 0.85rem;
  line-height: 1.6;
  background-color: #f1f5f9;
  border-radius: 8px;
}

/* 平板版：主要區域改成單欄 */
@media (max-width: 800px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

/* 手機版 */
@media (max-width: 600px) {
  .checkout-page {
    padding: 48px 16px;
  }

  .checkout-form,
  .order-summary {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group-full {
    grid-column: auto;
  }

  .form-heading,
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .required-note {
    order: -1;
  }

  .back-link,
  .submit-button {
    width: 100%;
  }
}
</style>