<script setup>
import { reactive } from "vue"
import {
  RouterLink,
  useRouter,
} from "vue-router"

import { useProductStore } from "../stores/product.js"
import { handleShowToast } from "../utils/toastHelper.js"

const productStore = useProductStore()
const router = useRouter()

// ==================================================
// 表單資料
// ==================================================

const productForm = reactive({
  name: "",
  price: "",
  image: "",
  category: "",
  stock: 0,
  rating: 5,
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

// 清除上一次驗證留下的錯誤
const resetErrorMessage = () => {
  Object.keys(errorMessage).forEach(
    (key) => {
      errorMessage[key] = ""
    },
  )
}

// 驗證圖片網址
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
// 表單驗證
// ==================================================

const validateForm = () => {
  resetErrorMessage()

  const name = productForm.name.trim()
  const image = productForm.image.trim()
  const category =
    productForm.category.trim()
  const description =
    productForm.description.trim()

  const price =
    Number(productForm.price)

  const stock =
    Number(productForm.stock)

  const rating =
    Number(productForm.rating)

  if (name.length < 2) {
    errorMessage.name =
      "商品名稱至少需要 2 個字。"
  }

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    errorMessage.price =
      "商品價格必須大於 0。"
  }

  if (!image) {
    errorMessage.image =
      "請輸入商品圖片網址。"
  } else if (!isValidImageUrl(image)) {
    errorMessage.image =
      "請輸入有效的 http 或 https 圖片網址。"
  }

  if (!category) {
    errorMessage.category =
      "請輸入商品分類。"
  }

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    errorMessage.stock =
      "庫存必須是大於或等於 0 的整數。"
  }

  if (
    !Number.isFinite(rating) ||
    rating < 0 ||
    rating > 5
  ) {
    errorMessage.rating =
      "評分必須介於 0 到 5 之間。"
  }

  if (description.length < 10) {
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
// 建立送給 Store 的乾淨資料
// ==================================================

const getProductPayload = () => {
  return {
    name: productForm.name.trim(),

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
// 送出表單
// ==================================================

const handleSubmit = async () => {
  if (
    productStore.isCreatingProduct
  ) {
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

  const productPayload =
    getProductPayload()

  const result =
    await productStore.createProduct(
      productPayload,
    )

  handleShowToast(result)

  if (result.success) {
    router.push({
      name: "admin-products",
    })
  }
}
</script>

<template>
  <main class="create-product-page">
    <section class="create-container">
      <header class="page-heading">
        <div>
          <p class="page-label">
            ADMIN DASHBOARD
          </p>

          <h1>新增商品</h1>

          <p class="page-description">
            填寫商品資訊後，資料將透過
            JSON Server 寫入
            <code>db.json</code>。
          </p>
        </div>

        <RouterLink
          class="back-link"
          :to="{
            name: 'admin-products',
          }"
        >
          返回商品管理
        </RouterLink>
      </header>

      <form
        class="product-form"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="form-heading">
          <div>
            <p class="form-step">
              PRODUCT INFORMATION
            </p>

            <h2>商品基本資料</h2>
          </div>

          <span class="required-note">
            * 為必填欄位
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
              v-model.trim="
                productForm.name
              "
              type="text"
              name="product-name"
              autocomplete="off"
              placeholder="例如：無線人體工學滑鼠"
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
            />

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
              v-model.trim="
                productForm.category
              "
              type="text"
              name="product-category"
              autocomplete="off"
              placeholder="例如：滑鼠"
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
            />

            <p
              v-if="errorMessage.category"
              id="product-category-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.category }}
            </p>
          </div>

          <!-- 商品價格 -->
          <div class="form-group">
            <label for="product-price">
              商品價格 *
            </label>

            <div class="input-prefix">
              <span aria-hidden="true">
                NT$
              </span>

              <input
                id="product-price"
                v-model.number="
                  productForm.price
                "
                type="number"
                name="product-price"
                min="1"
                step="1"
                inputmode="numeric"
                placeholder="例如：1200"
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
              />
            </div>

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
              name="product-stock"
              min="0"
              step="1"
              inputmode="numeric"
              placeholder="例如：10"
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
            />

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
              name="product-rating"
              min="0"
              max="5"
              step="0.1"
              inputmode="decimal"
              placeholder="例如：4.5"
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
            />

            <p class="input-help">
              請輸入 0 到 5 之間的數字。
            </p>

            <p
              v-if="errorMessage.rating"
              id="product-rating-error"
              class="error-message"
              role="alert"
            >
              {{ errorMessage.rating }}
            </p>
          </div>

          <!-- 商品圖片 -->
          <div class="form-group">
            <label for="product-image">
              圖片網址 *
            </label>

            <input
              id="product-image"
              v-model.trim="
                productForm.image
              "
              type="url"
              name="product-image"
              autocomplete="url"
              placeholder="https://example.com/product.jpg"
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
            />

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
              v-model.trim="
                productForm.description
              "
              name="product-description"
              rows="6"
              placeholder="請輸入至少 10 個字的商品說明"
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
          aria-labelledby="preview-title"
        >
          <div>
            <p class="preview-label">
              IMAGE PREVIEW
            </p>

            <h2 id="preview-title">
              圖片預覽
            </h2>
          </div>

          <img
            :src="productForm.image"
            :alt="
              productForm.name ||
              '新商品圖片預覽'
            "
          />
        </section>

        <div class="form-actions">
          <RouterLink
            class="cancel-button"
            :to="{
              name: 'admin-products',
            }"
          >
            取消
          </RouterLink>

          <button
            type="submit"
            class="submit-button"
            :disabled="
              productStore
                .isCreatingProduct
            "
          >
            <span
              v-if="
                productStore
                  .isCreatingProduct
              "
              class="button-spinner"
              aria-hidden="true"
            ></span>

            {{
              productStore
                .isCreatingProduct
                ? "建立商品中..."
                : "建立商品"
            }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.create-product-page {
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

.create-container {
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
.form-step,
.preview-label {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.page-description {
  max-width: 640px;
  margin: 18px 0 0;
  color: #475569;
  line-height: 1.8;
}

.page-description code {
  padding: 2px 7px;
  color: #0f172a;
  font-weight: 800;
  background-color: #e2e8f0;
  border-radius: 6px;
}

.back-link {
  flex-shrink: 0;
  padding: 11px 18px;
  color: #0f766e;
  font-weight: 800;
  text-decoration: none;
  background-color: #ffffff;
  border: 1px solid #5eead4;
  border-radius: 11px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.back-link:hover {
  color: #ffffff;
  background-color: #0f766e;
}

.product-form {
  margin-top: 40px;
  padding: 36px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgb(15 23 42 / 10%);
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
  font-size: 1.55rem;
}

.required-note {
  flex-shrink: 0;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 800;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 24px;
  margin-top: 28px;
}

.form-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
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

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
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
  border-color: #dc2626;
  background-color: #fff7f7;
}

.form-group input.input-error:focus,
.form-group textarea.input-error:focus {
  box-shadow:
    0 0 0 4px
    rgb(220 38 38 / 15%);
}

.input-prefix {
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr);
  align-items: center;
  border: 1px solid #94a3b8;
  border-radius: 11px;
  overflow: hidden;
}

.input-prefix:focus-within {
  border-color: #0f766e;
  box-shadow:
    0 0 0 4px
    rgb(20 184 166 / 18%);
}

.input-prefix span {
  display: grid;
  height: 100%;
  padding-inline: 13px;
  place-items: center;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 900;
  background-color: #f1f5f9;
  border-right: 1px solid #cbd5e1;
}

.input-prefix input {
  border: 0;
  border-radius: 0;
}

.input-prefix input:focus {
  box-shadow: none;
}

.input-prefix:has(
  input.input-error
) {
  border-color: #dc2626;
}

.error-message {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.5;
}

.input-help {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
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
.submit-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  font: inherit;
  font-weight: 800;
  border-radius: 11px;
}

.cancel-button {
  color: #334155;
  text-decoration: none;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
}

.cancel-button:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

.submit-button {
  gap: 9px;
  color: #ffffff;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #115e59;
  transform: translateY(-2px);
}

.submit-button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: wait;
}

.back-link:focus-visible,
.cancel-button:focus-visible,
.submit-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.button-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid
    rgb(255 255 255 / 45%);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation:
    button-spin 0.75s linear infinite;
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .create-product-page {
    padding: 48px 16px 64px;
  }

  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .back-link {
    text-align: center;
  }

  .product-form {
    padding: 28px 20px;
    border-radius: 18px;
  }

  .form-heading {
    flex-direction: column;
    gap: 12px;
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