<script setup>
import {
  ref,
  onMounted,
} from "vue"

import { RouterLink } from "vue-router"

import { useAuthStore } from "../stores/auth.js"
import { useProductStore } from "../stores/product.js"

import { formatPrice } from "../utils/formatPrice.js"
import { handleShowToast } from "../utils/toastHelper.js"

import ConfirmDialog from "../components/ConfirmDialog.vue"

const authStore = useAuthStore()
const productStore = useProductStore()

// ==================================================
// 刪除狀態
// ==================================================

// 保存使用者準備刪除的商品。
// null 代表確認視窗目前關閉。
const productToDelete = ref(null)

// ==================================================
// 載入商品
// ==================================================

onMounted(async () => {
  await productStore.fetchProducts()
})

// ==================================================
// 顯示庫存狀態
// ==================================================

const getStockText = (stock) => {
  if (stock <= 0) {
    return "已售完"
  }

  if (stock <= 5) {
    return `僅剩 ${stock} 件`
  }

  return `庫存 ${stock} 件`
}

// ==================================================
// 判斷某一列是否正在刪除
// ==================================================

const isDeletingCurrentProduct = (
  product,
) => {
  return (
    productStore.isDeletingProduct &&
    String(
      productToDelete.value?.id,
    ) === String(product.id)
  )
}

// ==================================================
// 開啟刪除確認視窗
// ==================================================

const openDeleteDialog = (product) => {
  if (
    productStore.isDeletingProduct
  ) {
    return
  }

  // 複製商品基本資料，
  // 避免直接保存 Store 商品物件的參考。
  productToDelete.value = {
    ...product,
  }
}

// ==================================================
// 關閉刪除確認視窗
// ==================================================

const closeDeleteDialog = () => {
  // API 執行期間不可關閉視窗
  if (
    productStore.isDeletingProduct
  ) {
    return
  }

  productToDelete.value = null
}

// ==================================================
// 確認刪除商品
// ==================================================

const handleConfirmDelete =
  async () => {
    const selectedProduct =
      productToDelete.value

    if (
      !selectedProduct ||
      productStore.isDeletingProduct
    ) {
      return
    }

    try {
      const result =
        await productStore.deleteProduct(
          selectedProduct.id,
        )

      handleShowToast(result)

      // 刪除成功才關閉確認視窗
      if (result.success) {
        productToDelete.value = null
      }
    } catch (error) {
      // Store 原則上已處理 API 錯誤。
      // 這裡保留最後一道非預期錯誤防護。
      handleShowToast({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "商品刪除失敗，請稍後再試。",
      })
    }
  }
</script>

<template>
  <main class="admin-products-page">
    <section class="admin-container">
      <header class="admin-heading">
        <div>
          <p class="admin-label">
            ADMIN DASHBOARD
          </p>

          <h1>商品後台管理</h1>

          <p class="admin-description">
            歡迎回來，{{ authStore.user?.name }}。
            你可以在這裡檢視及管理商店中的商品資料。
          </p>
        </div>

        <RouterLink
          class="create-button"
          :to="{
            name: 'admin-product-create',
          }"
        >
          ＋ 新增商品
        </RouterLink>
      </header>

      <section class="summary-grid">
        <article class="summary-card">
          <p>商品總數</p>

          <strong>
            {{ productStore.productCount }}
          </strong>
        </article>

        <article class="summary-card">
          <p>目前管理員</p>

          <strong class="manager-name">
            {{ authStore.user?.name }}
          </strong>
        </article>
      </section>

      <section
        class="admin-panel"
        aria-labelledby="admin-product-title"
      >
        <div class="panel-heading">
          <div>
            <p class="panel-label">
              PRODUCT MANAGEMENT
            </p>

            <h2 id="admin-product-title">
              商品列表
            </h2>
          </div>

          <span class="product-count">
            共 {{ productStore.productCount }} 項
          </span>
        </div>

        <!-- 商品載入中 -->
        <div
          v-if="productStore.isLoading"
          class="state-message"
          role="status"
          aria-live="polite"
        >
          <span
            class="loading-spinner"
            aria-hidden="true"
          ></span>

          <h3>正在載入商品</h3>

          <p>
            請稍候，我們正在向商品 API 取得資料。
          </p>
        </div>

        <!-- 商品載入失敗 -->
        <div
          v-else-if="
            productStore.errorMessage
          "
          class="
            state-message
            state-message--error
          "
          role="alert"
        >
          <span
            class="state-icon"
            aria-hidden="true"
          >
            !
          </span>

          <h3>商品載入失敗</h3>

          <p>
            {{
              productStore.errorMessage
            }}
          </p>

          <button
            type="button"
            class="retry-button"
            @click="
              productStore.fetchProducts(
                true,
              )
            "
          >
            重新載入
          </button>
        </div>

        <!-- 目前沒有商品 -->
        <div
          v-else-if="
            productStore.products
              .length === 0
          "
          class="state-message"
        >
          <span
            class="empty-icon"
            aria-hidden="true"
          >
            📦
          </span>

          <h3>目前沒有商品</h3>

          <p>
            點擊「新增商品」，建立商店中的第一項商品。
          </p>

          <RouterLink
            class="empty-create-button"
            :to="{
              name:
                'admin-product-create',
            }"
          >
            ＋ 新增商品
          </RouterLink>
        </div>

        <!-- 商品表格 -->
        <div
          v-else
          class="table-scroll"
        >
          <table class="product-table">
            <thead>
              <tr>
                <th scope="col">
                  商品
                </th>

                <th scope="col">
                  分類
                </th>

                <th scope="col">
                  價格
                </th>

                <th scope="col">
                  庫存
                </th>

                <th scope="col">
                  評分
                </th>

                <th scope="col">
                  操作
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="
                  product in
                    productStore.products
                "
                :key="product.id"
                :class="{
                  'product-row--deleting':
                    isDeletingCurrentProduct(
                      product,
                    ),
                }"
              >
                <td>
                  <div class="product-information">
                    <img
                      :src="product.image"
                      :alt="product.name"
                      class="product-thumbnail"
                    />

                    <div class="product-text">
                      <strong>
                        {{ product.name }}
                      </strong>

                      <span>
                        ID：{{ product.id }}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="category-badge">
                    {{ product.category }}
                  </span>
                </td>

                <td class="price-cell">
                  {{
                    formatPrice(
                      product.price,
                    )
                  }}
                </td>

                <td>
                  <span
                    class="stock-badge"
                    :class="{
                      'stock-badge--available':
                        product.stock > 5,

                      'stock-badge--low':
                        product.stock > 0 &&
                        product.stock <= 5,

                      'stock-badge--sold-out':
                        product.stock <= 0,
                    }"
                  >
                    {{
                      getStockText(
                        product.stock,
                      )
                    }}
                  </span>
                </td>

                <td>
                  <span class="rating">
                    ★ {{ product.rating }}
                  </span>
                </td>

                <td>
                  <div class="action-group">
                    <RouterLink
                      class="view-button"
                      :to="{
                        name:
                          'product-detail',

                        params: {
                          id: product.id,
                        },
                      }"
                    >
                      查看
                    </RouterLink>

                    <RouterLink
                      class="edit-button"
                      :to="{
                        name:
                          'admin-product-edit',

                        params: {
                          id: product.id,
                        },
                      }"
                    >
                      編輯
                    </RouterLink>

                    <button
                      type="button"
                      class="delete-button"
                      :disabled="
                        productStore.isDeletingProduct
                      "
                      :aria-label="
                        `刪除商品 ${product.name}`
                      "
                      @click="
                        openDeleteDialog(product)
                      "
                    >
                      <span
                        v-if="
                          isDeletingCurrentProduct(
                            product,
                          )
                        "
                        class="button-spinner"
                        aria-hidden="true"
                      ></span>

                      {{
                        isDeletingCurrentProduct(
                          product,
                        )
                          ? "刪除中..."
                          : "刪除"
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
  <ConfirmDialog
    :open="
      Boolean(productToDelete)
    "
    title="確認刪除商品"
    :message="
      productToDelete
        ? `確定要刪除商品「${productToDelete.name}」嗎？\n刪除後無法直接復原。`
        : ''
    "
    confirm-text="確定刪除"
    cancel-text="取消"
    :is-loading="
      productStore.isDeletingProduct
    "
    @confirm="handleConfirmDelete"
    @cancel="closeDeleteDialog"
  />
</template>

<style scoped>
.admin-products-page {
  min-height: calc(100vh - 72px);
  padding: 64px 20px 80px;
  background:
    radial-gradient(
      circle at top right,
      rgb(204 251 241 / 70%),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.admin-container {
  width: min(100%, 1120px);
  margin-inline: auto;
}

.admin-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.admin-heading > div {
  min-width: 0;
}

.admin-label,
.panel-label {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.admin-heading h1 {
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

.admin-description {
  max-width: 680px;
  margin: 18px 0 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.create-button {
  display: inline-flex;
  min-height: 46px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 12px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.create-button:hover {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.create-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 20px;
  margin-top: 40px;
}

.summary-card {
  min-width: 0;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  box-shadow:
    0 12px 30px
    rgb(15 23 42 / 7%);
}

.summary-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
  color: #0f766e;
  font-size: 2rem;
}

.summary-card .manager-name {
  overflow: hidden;
  color: #0f172a;
  font-size: 1.25rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-panel {
  margin-top: 24px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 24px;
  box-shadow:
    0 20px 50px
    rgb(15 23 42 / 10%);
  overflow: hidden;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  border-bottom: 1px solid #e2e8f0;
}

.panel-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.65rem;
}

.product-count {
  flex-shrink: 0;
  padding: 8px 14px;
  color: #0f766e;
  font-weight: 800;
  background-color: #ccfbf1;
  border-radius: 999px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.product-table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  padding: 18px 20px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

.product-table th {
  color: #334155;
  font-size: 0.85rem;
  font-weight: 900;
  background-color: #f8fafc;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.product-table tbody tr {
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.product-table tbody tr:hover {
  background-color: #f8fafc;
}

.product-table tbody tr:last-child td {
  border-bottom: 0;
}

.product-row--deleting {
  opacity: 0.58;
  background-color: #fff7f7;
}

.product-information {
  display: flex;
  min-width: 250px;
  align-items: center;
  gap: 14px;
}

.product-thumbnail {
  display: block;
  width: 72px;
  height: 54px;
  flex-shrink: 0;
  object-fit: cover;
  background-color: #e2e8f0;
  border-radius: 10px;
}

.product-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.product-text strong {
  overflow: hidden;
  max-width: 220px;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-text span {
  color: #64748b;
  font-size: 0.8rem;
}

.category-badge,
.stock-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 0.82rem;
  font-weight: 800;
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
}

.category-badge {
  color: #4338ca;
  background-color: #eef2ff;
  border-color: #c7d2fe;
}

.stock-badge--available {
  color: #166534;
  background-color: #dcfce7;
  border-color: #86efac;
}

.stock-badge--low {
  color: #92400e;
  background-color: #fef3c7;
  border-color: #fcd34d;
}

.stock-badge--sold-out {
  color: #991b1b;
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.price-cell {
  color: #0f766e;
  font-weight: 900;
  white-space: nowrap;
}

.rating {
  color: #92400e;
  font-weight: 800;
  white-space: nowrap;
}

.action-group {
  display: flex;
  min-width: 230px;
  align-items: center;
  gap: 8px;
}

.view-button,
.edit-button,
.delete-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  padding: 8px 13px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;
  border-radius: 9px;
  white-space: nowrap;
}

.view-button {
  color: #0f766e;
  background-color: #f0fdfa;
  border: 1px solid #5eead4;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.view-button:hover {
  color: #ffffff;
  background-color: #0f766e;
  transform: translateY(-2px);
}

.edit-button {
  color: #4338ca;
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.edit-button:hover {
  color: #ffffff;
  background-color: #4f46e5;
  border-color: #4f46e5;
  transform: translateY(-2px);
}

.delete-button {
  gap: 7px;
  color: #b91c1c;
  background-color: #fff7f7;
  border: 1px solid #fca5a5;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.delete-button:hover:not(:disabled) {
  color: #ffffff;
  background-color: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(-2px);
}

.delete-button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: wait;
}

.view-button:focus-visible,
.create-button:focus-visible,
.empty-create-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.edit-button:focus-visible {
  outline: 3px solid #a5b4fc;
  outline-offset: 3px;
}

.delete-button:focus-visible,
.retry-button:focus-visible {
  outline: 3px solid #fca5a5;
  outline-offset: 3px;
}

.button-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid
    rgb(100 116 139 / 35%);
  border-top-color: currentColor;
  border-radius: 50%;
  animation:
    spin 0.7s linear infinite;
}

.state-message {
  display: grid;
  min-height: 320px;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 48px 20px;
  text-align: center;
}

.state-message h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.35rem;
}

.state-message p {
  max-width: 520px;
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.state-message--error {
  background-color: #fff7ed;
}

.state-icon,
.empty-icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  font-size: 1.5rem;
  font-weight: 900;
  border-radius: 50%;
}

.state-icon {
  color: #991b1b;
  background-color: #fee2e2;
}

.empty-icon {
  background-color: #f1f5f9;
}

.empty-create-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  padding: 10px 18px;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
  background-color: #0f766e;
  border-radius: 10px;
}

.loading-spinner {
  width: 46px;
  height: 46px;
  border: 5px solid #ccfbf1;
  border-top-color: #0f766e;
  border-radius: 50%;
  animation:
    spin 0.8s linear infinite;
}

.retry-button {
  min-height: 42px;
  margin-top: 8px;
  padding: 10px 18px;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  background-color: #b91c1c;
  border: 1px solid #b91c1c;
  border-radius: 10px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #991b1b;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .admin-products-page {
    padding: 48px 16px 64px;
  }

  .admin-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .create-button {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .panel-heading {
    align-items: flex-start;
    padding: 24px 20px;
  }
}
</style>