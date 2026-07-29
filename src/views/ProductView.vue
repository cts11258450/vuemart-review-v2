<script setup>
import {
  ref,
  computed,
  watch,
} from "vue"

import {
  useRoute,
  useRouter,
} from "vue-router"

import ProductCard from "../components/ProductCard.vue"

import { useProductStore } from "../stores/product.js"
import { useCartStore } from "../stores/cart.js"

import { handleShowToast } from "../utils/toastHelper.js"

const productStore = useProductStore()
const cartStore = useCartStore()

const route = useRoute()
const router = useRouter()

// 允許出現在網址中的 Query 名稱
const allowedQueryKeys = [
  "searchKeyword",
  "selectCategory",
  "selectSort",
]

// 允許使用的排序方式
const validSortTypes = [
  "default",
  "price-asc",
  "price-desc",
]

// 從商品資料中取得不重複的分類
const categoryArray = computed(() => {
  const categories = productStore.products
    .map((product) => {
      return product.category
    })
    .filter((category) => {
      return (
        typeof category === "string" &&
        category !== ""
      )
    })

  return [...new Set(categories)]
})

// 驗證搜尋關鍵字
const getSafeSearchKeyword = (value) => {
  if (typeof value === "string") {
    return value.trim()
  }

  return ""
}

// 驗證商品分類
const getSafeCategory = (value) => {
  if (
    typeof value === "string" &&
    categoryArray.value.includes(value)
  ) {
    return value
  }

  return "all"
}

// 驗證排序方式
const getSafeSelectSort = (value) => {
  if (
    typeof value === "string" &&
    validSortTypes.includes(value)
  ) {
    return value
  }

  return "default"
}

// 從 route.query 取得安全的搜尋關鍵字
const getSafeSearchKeywordFromQuery = () => {
  return getSafeSearchKeyword(
    route.query.searchKeyword,
  )
}

// 從 route.query 取得安全的商品分類
const getSafeSelectCategoryFromQuery = () => {
  return getSafeCategory(
    route.query.selectCategory,
  )
}

// 從 route.query 取得安全的排序方式
const getSafeSelectSortFromQuery = () => {
  return getSafeSelectSort(
    route.query.selectSort,
  )
}

// 將網址 Query 轉成安全的畫面狀態
const getSafeStateFromQuery = () => {
  return {
    searchKeyword:
      getSafeSearchKeywordFromQuery(),

    selectCategory:
      getSafeSelectCategoryFromQuery(),

    selectSort:
      getSafeSelectSortFromQuery(),
  }
}

// 將畫面狀態轉成乾淨的 Query
const getSafeQueryFromState = (
  state = {
    searchKeyword: searchKeyword.value,
    selectCategory: selectCategory.value,
    selectSort: selectSort.value,
  },
) => {
  const safeSearchKeyword =
    getSafeSearchKeyword(
      state.searchKeyword,
    )

  const safeSelectCategory =
    getSafeCategory(
      state.selectCategory,
    )

  const safeSelectSort =
    getSafeSelectSort(
      state.selectSort,
    )

  return {
    searchKeyword:
      safeSearchKeyword || undefined,

    selectCategory:
      safeSelectCategory === "all"
        ? undefined
        : safeSelectCategory,

    selectSort:
      safeSelectSort === "default"
        ? undefined
        : safeSelectSort,
  }
}

// 檢查 Query 是否含有額外欄位
const hasOnlyAllowedQueryKeys = (query) => {
  return Object.keys(query).every((key) => {
    return allowedQueryKeys.includes(key)
  })
}

// 比較兩份 Query 是否相同
const isSameQuery = (queryA, queryB) => {
  return (
    hasOnlyAllowedQueryKeys(queryA) &&

    (queryA.searchKeyword || undefined) ===
      (queryB.searchKeyword || undefined) &&

    (queryA.selectCategory || undefined) ===
      (queryB.selectCategory || undefined) &&

    (queryA.selectSort || undefined) ===
      (queryB.selectSort || undefined)
  )
}

// 初始畫面狀態
const searchKeyword = ref(
  getSafeSearchKeywordFromQuery(),
)

const selectCategory = ref(
  getSafeSelectCategoryFromQuery(),
)

const selectSort = ref(
  getSafeSelectSortFromQuery(),
)

// 是否正在使用搜尋或篩選條件
const hasActiveFilters = computed(() => {
  return (
    searchKeyword.value !== "" ||
    selectCategory.value !== "all" ||
    selectSort.value !== "default"
  )
})

// 搜尋、分類與排序後的商品
const showProducts = computed(() => {
  const normalizedKeyword =
    searchKeyword.value
      .trim()
      .toLowerCase()

  const filteredProducts =
    productStore.products.filter((product) => {
      const normalizedProductName =
        String(product.name)
          .toLowerCase()

      const matchesKeyword =
        normalizedProductName.includes(
          normalizedKeyword,
        )

      const matchesCategory =
        selectCategory.value === "all" ||
        selectCategory.value === product.category

      return (
        matchesKeyword &&
        matchesCategory
      )
    })

  const sortedProducts = [
    ...filteredProducts,
  ]

  if (selectSort.value === "price-asc") {
    sortedProducts.sort((productA, productB) => {
      return productA.price - productB.price
    })
  }

  if (selectSort.value === "price-desc") {
    sortedProducts.sort((productA, productB) => {
      return productB.price - productA.price
    })
  }

  return sortedProducts
})

// 重置搜尋條件
const resetSearch = () => {
  searchKeyword.value = ""
  selectCategory.value = "all"
  selectSort.value = "default"
}

// 加入購物車
const handleAddToCart = (product) => {
  const result =
    cartStore.addToCart(product)

  handleShowToast(result)
}

// 畫面 state 改變時，更新網址 Query
watch(
  [
    searchKeyword,
    selectCategory,
    selectSort,
  ],
  () => {
    const safeQuery =
      getSafeQueryFromState()

    if (
      isSameQuery(
        route.query,
        safeQuery,
      )
    ) {
      return
    }

    router.replace({
      query: safeQuery,
    })
  },
)

// 網址 Query 改變時，淨化網址並同步畫面 state
watch(
  () => {
    return route.query
  },
  () => {
    const safeState =
      getSafeStateFromQuery()

    const safeQuery =
      getSafeQueryFromState(safeState)

    // 網址包含不合法資料時，先修正網址
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

    // 網址已經安全，才同步畫面狀態
    searchKeyword.value =
      safeState.searchKeyword

    selectCategory.value =
      safeState.selectCategory

    selectSort.value =
      safeState.selectSort
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="product-page">
    <section
      class="products-section"
      aria-labelledby="products-title"
    >
      <header class="section-heading">
        <p class="section-label">
          FEATURED PRODUCTS
        </p>

        <h1 id="products-title">
          找到適合你的桌面裝備
        </h1>

        <p class="product-description">
          精選實用的桌面周邊商品，打造更舒適的工作與學習環境。
        </p>

        <p class="product-summary">
          全部共有
          <strong>
            {{ productStore.productCount }}
          </strong>
          項商品
        </p>
      </header>

      <section
        class="filter-panel"
        aria-labelledby="filter-title"
      >
        <header class="filter-heading">
          <div>
            <p class="filter-label">
              PRODUCT FILTER
            </p>

            <h2 id="filter-title">
              搜尋與篩選
            </h2>
          </div>

          <p
            class="filter-status"
            aria-live="polite"
          >
            顯示
            <strong>{{ showProducts.length }}</strong>
            /
            {{ productStore.productCount }}
            項
          </p>
        </header>

        <div class="filter-grid">
          <div class="filter-group search-group">
            <label for="product-search">
              搜尋商品
            </label>

            <input
              id="product-search"
              v-model.trim="searchKeyword"
              type="search"
              name="searchKeyword"
              placeholder="輸入商品名稱"
            />
          </div>

          <div class="filter-group">
            <label for="product-category">
              商品分類
            </label>

            <select
              id="product-category"
              v-model="selectCategory"
              name="selectCategory"
            >
              <option value="all">
                全部分類
              </option>

              <option
                v-for="category in categoryArray"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="product-sort">
              商品排序
            </label>

            <select
              id="product-sort"
              v-model="selectSort"
              name="selectSort"
            >
              <option value="default">
                預設排序
              </option>

              <option value="price-asc">
                價格由低至高
              </option>

              <option value="price-desc">
                價格由高至低
              </option>
            </select>
          </div>

          <button
            type="button"
            class="reset-button"
            :disabled="!hasActiveFilters"
            @click="resetSearch"
          >
            重置條件
          </button>
        </div>
      </section>

      <ul
        v-if="showProducts.length > 0"
        class="product-list"
      >
        <ProductCard
          v-for="product in showProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
        />
      </ul>

      <section
        v-else
        class="empty-state"
        aria-live="polite"
      >
        <span
          class="empty-icon"
          aria-hidden="true"
        >
          ?
        </span>

        <h2>找不到符合條件的商品</h2>

        <p>
          請嘗試其他關鍵字或重設篩選條件。
        </p>

        <button
          type="button"
          class="empty-reset-button"
          @click="resetSearch"
        >
          清除所有條件
        </button>
      </section>
    </section>
  </main>
</template>

<style scoped>
.product-page {
  min-height: calc(100vh - 72px);
  padding: 64px 20px 80px;
  background:
    radial-gradient(
      circle at top left,
      rgb(204 251 241 / 65%),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );
}

.products-section {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.section-heading {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.section-label,
.filter-label {
  margin: 0 0 12px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.section-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.product-description {
  max-width: 620px;
  margin: 20px auto 0;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.product-summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 24px 0 0;
  padding: 9px 16px;
  color: #334155;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
}

.product-summary strong {
  color: #0f766e;
  font-size: 1.1rem;
}

/* 搜尋及篩選面板 */
.filter-panel {
  margin-top: 44px;
  padding: 28px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgb(15 23 42 / 9%);
}

.filter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.filter-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.4rem;
}

.filter-status {
  margin: 0;
  padding: 8px 14px;
  color: #334155;
  font-size: 0.9rem;
  background-color: #f1f5f9;
  border-radius: 999px;
  white-space: nowrap;
}

.filter-status strong {
  color: #0f766e;
  font-size: 1rem;
}

/* 四欄控制列 */
.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(220px, 2fr)
    minmax(150px, 1fr)
    minmax(170px, 1fr)
    auto;
  align-items: end;
  gap: 18px;
  margin-top: 24px;
}

.filter-group {
  display: grid;
  gap: 9px;
  min-width: 0;
}

.filter-group label {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.filter-group input,
.filter-group select {
  width: 100%;
  min-height: 46px;
  padding: 11px 13px;
  color: #0f172a;
  font: inherit;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.filter-group input:hover,
.filter-group select:hover {
  border-color: #475569;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #0f766e;
  outline: none;
  box-shadow:
    0 0 0 4px rgb(20 184 166 / 20%);
}

.filter-group input::placeholder {
  color: #64748b;
}

.reset-button,
.empty-reset-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  color: #ffffff;
  font-weight: 800;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.reset-button:hover:not(:disabled),
.empty-reset-button:hover {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.reset-button:focus-visible,
.empty-reset-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

.reset-button:disabled {
  color: #64748b;
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.8;
}

.product-list {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
}

/* 沒有搜尋結果 */
.empty-state {
  margin-top: 40px;
  padding: 56px 24px;
  text-align: center;
  background-color: #ffffff;
  border: 1px dashed #94a3b8;
  border-radius: 20px;
}

.empty-icon {
  display: grid;
  width: 56px;
  height: 56px;
  margin: 0 auto;
  place-items: center;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 900;
  background-color: #0f766e;
  border-radius: 50%;
}

.empty-state h2 {
  margin: 22px 0 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 12px 0 24px;
  color: #475569;
  line-height: 1.7;
}

/* 平板版 */
@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .reset-button {
    grid-column: 1 / -1;
  }
}

/* 手機版 */
@media (max-width: 600px) {
  .product-page {
    padding: 48px 16px 64px;
  }

  .filter-panel {
    padding: 22px;
  }

  .filter-heading {
    flex-direction: column;
    gap: 16px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .reset-button {
    grid-column: auto;
    width: 100%;
  }

  .product-list {
    grid-template-columns: 1fr;
    margin-top: 32px;
  }
}
</style>