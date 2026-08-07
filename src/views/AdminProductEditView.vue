<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
} from "vue"

import {
  useRoute,
  useRouter,
} from "vue-router"

import { useProductStore } from "../stores/product.js"
import { handleShowToast } from "../utils/toastHelper.js"

import LoadingState from "../components/LoadingState.vue"
import ErrorState from "../components/ErrorState.vue"

// ==================================================
// Store 與 Router
// ==================================================

const productStore = useProductStore()
const route = useRoute()
const router = useRouter()

// ==================================================
// 頁面狀態
// ==================================================

// 是否正在初始化編輯頁面
const isInitializing = ref(false)

// 商品資料是否讀取失敗
const loadFailed = ref(false)

// API 成功，但網址中的商品不存在
const productNotFound = ref(false)

// 商品是否正在更新
const isUpdating = computed(() => {
  return (
    productStore.isUpdatingProduct
  )
})

// 根據網址中的 ID 取得商品
const editingProduct = computed(() => {
  return productStore.getProductById(
    route.params.id,
  )
})

// 保存表單初始化完成後的資料。
// 不需要使用 ref，因為它不會直接顯示在 template。
let initialProductState = {}

// ==================================================
// 表單資料
// ==================================================

const productForm = reactive({
  name: "",
  price: "",
  image: "",
  category: "",
  stock: "",
  rating: "",
  description: "",
})

// ==================================================
// 錯誤訊息
// ==================================================

const errorMessage = reactive({
  name: "",
  price: "",
  image: "",
  category: "",
  stock: "",
  rating: "",
  description: "",
})

// ==================================================
// 資料正規化
// ==================================================

const getNormalizedProduct = () => {
  return {
    name:
      productForm.name.trim(),

    price:
      Number(productForm.price),

    image:
      productForm.image.trim(),

    category:
      productForm.category.trim(),

    stock:
      Number(productForm.stock),

    rating:
      Number(productForm.rating),

    description:
      productForm.description.trim(),
  }
}

// ==================================================
// 初始化表單
// ==================================================

const initializeForm = (product) => {
  Object.assign(productForm, {
    // 使用 ?? 可以保留合法的數字 0。
    name: product.name ?? "",
    price: product.price ?? "",
    image: product.image ?? "",
    category:
      product.category ?? "",
    stock: product.stock ?? "",
    rating: product.rating ?? "",
    description:
      product.description ?? "",
  })
}

// ==================================================
// 比較表單是否有變更
// ==================================================

const isSameState = (
  currentState,
) => {
  return (
    initialProductState.name ===
      currentState.name &&

    initialProductState.price ===
      currentState.price &&

    initialProductState.image ===
      currentState.image &&

    initialProductState.category ===
      currentState.category &&

    initialProductState.stock ===
      currentState.stock &&

    initialProductState.rating ===
      currentState.rating &&

    initialProductState.description ===
      currentState.description
  )
}

// ==================================================
// 驗證工具
// ==================================================

const resetErrorMessage = () => {
  Object.keys(errorMessage).forEach(
    (key) => {
      errorMessage[key] = ""
    },
  )
}

// 不使用 !value，因為數字 0 是合法值。
const isBlank = (value) => {
  return (
    value === "" ||
    value === null ||
    value === undefined
  )
}

const isValidImageUrl = (value) => {
  try {
    const url = new URL(value)

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    )
  } catch {
    return false
  }
}

// ==================================================
// 驗證表單
// ==================================================

const validateForm = () => {
  resetErrorMessage()

  const normalizedProduct =
    getNormalizedProduct()

  if (
    normalizedProduct.name.length <
    2
  ) {
    errorMessage.name =
      "商品名稱至少需要 2 個字。"
  }

  if (isBlank(productForm.price)) {
    errorMessage.price =
      "請輸入商品價格。"
  } else if (
    !Number.isFinite(
      normalizedProduct.price,
    ) ||
    normalizedProduct.price <= 0
  ) {
    errorMessage.price =
      "商品價格必須大於 0。"
  }

  if (!normalizedProduct.image) {
    errorMessage.image =
      "請輸入商品圖片網址。"
  } else if (
    !isValidImageUrl(
      normalizedProduct.image,
    )
  ) {
    errorMessage.image =
      "請輸入有效的 http 或 https 圖片網址。"
  }

  if (
    !normalizedProduct.category
  ) {
    errorMessage.category =
      "請輸入商品分類。"
  }

  if (isBlank(productForm.stock)) {
    errorMessage.stock =
      "請輸入商品庫存。"
  } else if (
    !Number.isInteger(
      normalizedProduct.stock,
    ) ||
    normalizedProduct.stock < 0
  ) {
    errorMessage.stock =
      "庫存必須是大於或等於 0 的整數。"
  }

  if (isBlank(productForm.rating)) {
    errorMessage.rating =
      "請輸入商品評分。"
  } else if (
    !Number.isFinite(
      normalizedProduct.rating,
    ) ||
    normalizedProduct.rating < 0 ||
    normalizedProduct.rating > 5
  ) {
    errorMessage.rating =
      "評分必須介於 0 到 5 之間。"
  }

  if (
    normalizedProduct.description
      .length < 10
  ) {
    errorMessage.description =
      "商品說明至少需要 10 個字。"
  }

  return Object.values(
    errorMessage,
  ).every((message) => {
    return message === ""
  })
}

// ==================================================
// 返回商品列表
// ==================================================

const closeForm = () => {
  router.push({
    name: "admin-products",
  })
}

// ==================================================
// 更新商品
// ==================================================

const handleUpdateProduct =
  async () => {
    if (isUpdating.value) {
      return
    }

    const isValid = validateForm()

    if (!isValid) {
      handleShowToast({
        success: false,

        message:
          "請檢查商品資料是否填寫正確。",
      })

      return
    }

    const productId =
      route.params.id

    const updatePayload =
      getNormalizedProduct()

    // 資料完全沒有改變時，
    // 不需要發送 PATCH。
    if (
      isSameState(updatePayload)
    ) {
      handleShowToast({
        success: false,

        message:
          "商品資料沒有變更，請修改資料或返回商品列表。",
      })

      return
    }

    try {
      const result =
        await productStore.updateProduct(
          productId,
          updatePayload,
        )

      handleShowToast(result)

      if (result.success) {
        router.push({
          name: "admin-products",
        })
      }
    } catch (error) {
      // Store 原則上已經處理 API 錯誤。
      // 這裡保留最後一道非預期錯誤防護。
      handleShowToast({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "商品更新失敗。",
      })
    }
  }

// ==================================================
// 載入商品資料
// ==================================================

const reload = async () => {
  isInitializing.value = true
  loadFailed.value = false
  productNotFound.value = false

  try {
    // true 代表忽略 hasLoaded，
    // 強制向 API 取得最新商品資料。
    const result =
      await productStore.fetchProducts(
        true,
      )

    if (!result.success) {
      loadFailed.value = true
      handleShowToast(result)

      return
    }

    const product =
      editingProduct.value

    if (!product) {
      productNotFound.value = true

      return
    }

    initializeForm(product)

    // 初始資料和送出資料都經過相同正規化，
    // 避免因型別不同而誤判為已修改。
    initialProductState =
      getNormalizedProduct()
  } catch (error) {
    loadFailed.value = true

    handleShowToast({
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "商品資料載入失敗。",
    })
  } finally {
    isInitializing.value = false
  }
}

// ==================================================
// 元件掛載
// ==================================================

onMounted(reload)
</script>

<template>
  <!-- 載入中 -->
  <LoadingState
    v-if="isInitializing"
  />

  <!-- 載入失敗 -->
  <ErrorState
    v-else-if="loadFailed"
    @retry="reload"
  />

  <!-- 找不到商品 -->
  <main
    v-else-if="productNotFound"
    class="edit-product-page"
  >
    <section class="state-card">
      <span
        class="state-icon"
        aria-hidden="true"
      >
        ?
      </span>

      <h1>找不到指定商品</h1>

      <p>
        商品可能已經被刪除，或網址中的商品
        ID 不正確。
      </p>

      <button
        type="button"
        class="primary-button"
        @click="closeForm"
      >
        返回商品管理
      </button>
    </section>
  </main>

  <!-- 編輯表單 -->
  <main
    v-else
    class="edit-product-page"
  >
    <section class="edit-container">
      <header class="page-heading">
        <div>
          <p class="page-label">
            ADMIN DASHBOARD
          </p>

          <h1>編輯商品</h1>

          <p class="page-description">
            修改商品資訊後，系統將透過
            PATCH 請求更新 JSON Server。
          </p>
        </div>

        <button
          type="button"
          class="back-button"
          :disabled="isUpdating"
          @click="closeForm"
        >
          返回商品管理
        </button>
      </header>

      <form
        class="product-form"
        novalidate
        @submit.prevent="
          handleUpdateProduct
        "
      >
        <div class="form-heading">
          <div>
            <p class="form-label">
              PRODUCT INFORMATION
            </p>

            <h2>商品基本資料</h2>
          </div>

          <span class="product-id">
            ID：{{ route.params.id }}
          </span>
        </div>

        <div class="form-grid">
          <!-- 商品名稱 -->
          <div class="form-group">
            <label for="product-name">
              商品名稱 *
            </label>

            <input
              id="product-name"
              v-model="productForm.name"
              type="text"
              :class="{
                'input-error':
                  errorMessage.name,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.name,
                )
              "
              :aria-describedby="
                errorMessage.name
                  ? 'product-name-error'
                  : undefined
              "
            >

            <p
              v-if="errorMessage.name"
              id="product-name-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.name }}
            </p>
          </div>

          <!-- 商品分類 -->
          <div class="form-group">
            <label for="product-category">
              商品分類 *
            </label>

            <input
              id="product-category"
              v-model="
                productForm.category
              "
              type="text"
              :class="{
                'input-error':
                  errorMessage.category,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.category,
                )
              "
              :aria-describedby="
                errorMessage.category
                  ? 'product-category-error'
                  : undefined
              "
            >

            <p
              v-if="
                errorMessage.category
              "
              id="product-category-error"
              class="error-message"
              role="alert"
            >
              {{
                errorMessage.category
              }}
            </p>
          </div>

          <!-- 商品價格 -->
          <div class="form-group">
            <label for="product-price">
              商品價格 *
            </label>

            <input
              id="product-price"
              v-model.number="
                productForm.price
              "
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              :class="{
                'input-error':
                  errorMessage.price,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.price,
                )
              "
              :aria-describedby="
                errorMessage.price
                  ? 'product-price-error'
                  : undefined
              "
            >

            <p
              v-if="errorMessage.price"
              id="product-price-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.price }}
            </p>
          </div>

          <!-- 商品庫存 -->
          <div class="form-group">
            <label for="product-stock">
              商品庫存 *
            </label>

            <input
              id="product-stock"
              v-model.number="
                productForm.stock
              "
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              :class="{
                'input-error':
                  errorMessage.stock,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.stock,
                )
              "
              :aria-describedby="
                errorMessage.stock
                  ? 'product-stock-error'
                  : undefined
              "
            >

            <p
              v-if="errorMessage.stock"
              id="product-stock-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.stock }}
            </p>
          </div>

          <!-- 商品評分 -->
          <div class="form-group">
            <label for="product-rating">
              商品評分 *
            </label>

            <input
              id="product-rating"
              v-model.number="
                productForm.rating
              "
              type="number"
              min="0"
              max="5"
              step="0.1"
              inputmode="decimal"
              :class="{
                'input-error':
                  errorMessage.rating,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.rating,
                )
              "
              :aria-describedby="
                errorMessage.rating
                  ? 'product-rating-error'
                  : undefined
              "
            >

            <p
              v-if="errorMessage.rating"
              id="product-rating-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.rating }}
            </p>
          </div>

          <!-- 圖片網址 -->
          <div class="form-group">
            <label for="product-image">
              圖片網址 *
            </label>

            <input
              id="product-image"
              v-model="productForm.image"
              type="url"
              :class="{
                'input-error':
                  errorMessage.image,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.image,
                )
              "
              :aria-describedby="
                errorMessage.image
                  ? 'product-image-error'
                  : undefined
              "
            >

            <p
              v-if="errorMessage.image"
              id="product-image-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.image }}
            </p>
          </div>

          <!-- 商品說明 -->
          <div
            class="
              form-group
              form-group--full
            "
          >
            <label for="product-description">
              商品說明 *
            </label>

            <textarea
              id="product-description"
              v-model="
                productForm.description
              "
              rows="6"
              :class="{
                'input-error':
                  errorMessage.description,
              }"
              :aria-invalid="
                Boolean(
                  errorMessage.description,
                )
              "
              :aria-describedby="
                errorMessage.description
                  ? 'product-description-error'
                  : undefined
              "
            ></textarea>

            <div class="description-meta">
              <p
                v-if="
                  errorMessage.description
                "
                id="product-description-error"
                class="error-message"
                role="alert"
              >
                {{
                  errorMessage.description
                }}
              </p>

              <span class="character-count">
                {{
                  productForm.description
                    .length
                }}
                個字
              </span>
            </div>
          </div>
        </div>

        <!-- 圖片預覽 -->
        <section
          v-if="
            isValidImageUrl(
              productForm.image,
            )
          "
          class="image-preview"
        >
          <div>
            <p class="form-label">
              IMAGE PREVIEW
            </p>

            <h2>圖片預覽</h2>
          </div>

          <img
            :src="productForm.image"
            :alt="
              productForm.name ||
              '商品圖片預覽'
            "
          >
        </section>

        <div class="form-actions">
          <button
            type="button"
            class="cancel-button"
            :disabled="isUpdating"
            @click="closeForm"
          >
            取消
          </button>

          <button
            type="submit"
            class="submit-button"
            :disabled="isUpdating"
          >
            <span
              v-if="isUpdating"
              class="button-spinner"
              aria-hidden="true"
            ></span>

            {{
              isUpdating
                ? "更新中..."
                : "更新商品"
            }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.edit-product-page {
  min-height: calc(100vh - 72px);
  padding: 64px 20px 80px;
  background:
    radial-gradient(
      circle at top right,
      rgb(204 251 241 / 65%),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.edit-container {
  width: min(100%, 960px);
  margin-inline: auto;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.page-heading > div {
  min-width: 0;
}

.page-label,
.form-label {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(
    2.2rem,
    6vw,
    3.8rem
  );
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.page-description {
  max-width: 620px;
  margin: 18px 0 0;
  color: #475569;
  line-height: 1.8;
}

.back-button {
  min-height: 44px;
  flex-shrink: 0;
  padding: 10px 18px;
  color: #0f766e;
  font: inherit;
  font-weight: 800;
  background-color: #ffffff;
  border: 1px solid #5eead4;
  border-radius: 11px;
  cursor: pointer;
}

.product-form {
  margin-top: 40px;
  padding: 36px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow:
    0 20px 50px
    rgb(15 23 42 / 10%);
}

.form-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.form-heading h2,
.image-preview h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.product-id {
  flex-shrink: 0;
  padding: 7px 12px;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 800;
  background-color: #f1f5f9;
  border-radius: 999px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  align-items: start;
  gap: 24px;
  margin-top: 28px;
}

.form-group {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-group label {
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 800;
}

.form-group input,
.form-group textarea {
  width: 100%;
  color: #0f172a;
  font: inherit;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 11px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input {
  min-height: 46px;
  padding: 11px 13px;
}

.form-group textarea {
  min-height: 150px;
  padding: 13px;
  line-height: 1.7;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #0f766e;
  box-shadow:
    0 0 0 4px
    rgb(20 184 166 / 18%);
}

.form-group input.input-error,
.form-group textarea.input-error {
  background-color: #fff7f7;
  border-color: #dc2626;
}

.error-message {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.5;
}

.description-meta {
  display: flex;
  min-height: 24px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.character-count {
  margin-left: auto;
  color: #64748b;
  font-size: 0.82rem;
  white-space: nowrap;
}

.image-preview {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(240px, 360px);
  align-items: center;
  gap: 32px;
  margin-top: 32px;
  padding: 24px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
}

.image-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background-color: #e2e8f0;
  border-radius: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-button,
.submit-button,
.primary-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  font: inherit;
  font-weight: 800;
  border-radius: 11px;
  cursor: pointer;
}

.cancel-button {
  color: #334155;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.submit-button,
.primary-button {
  gap: 9px;
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
}

.submit-button:hover:not(:disabled),
.primary-button:hover {
  background-color: #115e59;
}

.back-button:focus-visible,
.cancel-button:focus-visible,
.submit-button:focus-visible,
.primary-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

.button-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid
    rgb(255 255 255 / 45%);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation:
    button-spin
    0.75s
    linear
    infinite;
}

.state-card {
  width: min(100%, 560px);
  margin-inline: auto;
  padding: 48px 28px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow:
    0 20px 50px
    rgb(15 23 42 / 10%);
}

.state-icon {
  display: grid;
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  place-items: center;
  color: #92400e;
  font-size: 1.5rem;
  font-weight: 900;
  background-color: #fef3c7;
  border-radius: 50%;
}

.state-card h1 {
  margin: 0;
  color: #0f172a;
}

.state-card p {
  margin: 16px 0 24px;
  color: #475569;
  line-height: 1.7;
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .edit-product-page {
    padding: 48px 16px 64px;
  }

  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .back-button {
    width: 100%;
  }

  .product-form {
    padding: 28px 20px;
    border-radius: 18px;
  }

  .form-heading {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group--full {
    grid-column: auto;
  }

  .image-preview {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>