<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
} from "vue"

import {
  useRoute,
  useRouter,
} from "vue-router"

import ProductCard from "../components/ProductCard.vue"
import LoadingState from "../components/LoadingState.vue"
import ErrorState from "../components/ErrorState.vue"
import EmptyState from "../components/EmptyState.vue"

import { useProductStore } from "../stores/product.js"
import { useCartStore } from "../stores/cart.js"

import { handleShowToast } from "../utils/toastHelper.js"

const productStore = useProductStore()
const cartStore = useCartStore()

const route = useRoute()
const router = useRouter()

// Query 允許的欄位
const allowedQueryKeys = [
  "searchKeyword",
  "selectCategory",
  "selectSort",
]

// 排序允許值
const validSortTypes = [
  "default",
  "dec",
  "inc",
]

// 商品分類
const categoryArray = computed(() => {
  return [
    ...new Set(
      productStore.products.map((product) => {
        return product.category
      }),
    ),
  ]
})

// 安全搜尋文字
const getSafeSearchKeyword = (value) => {
  return typeof value === "string"
    ? value
    : ""
}

// 安全商品分類
const getSafeCategory = (value) => {
  if (
    typeof value === "string" &&
    categoryArray.value.includes(value)
  ) {
    return value
  }

  return "all"
}

// 安全排序方式
const getSafeSort = (value) => {
  if (
    typeof value === "string" &&
    validSortTypes.includes(value)
  ) {
    return value
  }

  return "default"
}

// 將 Route Query 轉成安全 State
const getSafeStateFromQuery = () => {
  return {
    searchKeyword:
      getSafeSearchKeyword(
        route.query.searchKeyword,
      ),

    selectCategory:
      getSafeCategory(
        route.query.selectCategory,
      ),

    selectSort:
      getSafeSort(
        route.query.selectSort,
      ),
  }
}

// 將 State 轉成乾淨 Query
const getQueryFromState = (state) => {
  const query = {}

  const safeSearchKeyword =
    getSafeSearchKeyword(
      state.searchKeyword,
    ).trim()

  const safeCategory =
    getSafeCategory(
      state.selectCategory,
    )

  const safeSort =
    getSafeSort(
      state.selectSort,
    )

  if (safeSearchKeyword) {
    query.searchKeyword =
      safeSearchKeyword
  }

  if (safeCategory !== "all") {
    query.selectCategory =
      safeCategory
  }

  if (safeSort !== "default") {
    query.selectSort =
      safeSort
  }

  return query
}

// 比較兩份 Query 是否相同
const isSameQuery = (
  queryA,
  queryB,
) => {
  const queryAKeys =
    Object.keys(queryA)

  const queryBKeys =
    Object.keys(queryB)

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

// 畫面篩選狀態
const searchKeyword = ref(
  getSafeSearchKeyword(
    route.query.searchKeyword,
  ),
)

// 商品載入前還無法驗證分類
const selectCategory = ref("all")

const selectSort = ref(
  getSafeSort(
    route.query.selectSort,
  ),
)

// 篩選與排序後的商品
const showProducts = computed(() => {
  const normalizedKeyword =
    searchKeyword.value
      .trim()
      .toLowerCase()

  const filteredProducts =
    productStore.products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
      ]
        .join(" ")
        .toLowerCase()

      const matchedKeyword =
        !normalizedKeyword ||
        searchableText.includes(
          normalizedKeyword,
        )

      const matchedCategory =
        selectCategory.value === "all" ||
        product.category ===
          selectCategory.value

      return (
        matchedKeyword &&
        matchedCategory
      )
    })

  // 複製後再排序，避免修改 Store 原陣列
  const sortedProducts = [
    ...filteredProducts,
  ]

  // 價格由低至高
  if (selectSort.value === "dec") {
    sortedProducts.sort((a, b) => {
      return a.price - b.price
    })
  }

  // 價格由高至低
  if (selectSort.value === "inc") {
    sortedProducts.sort((a, b) => {
      return b.price - a.price
    })
  }

  return sortedProducts
})

// EmptyState 標題
const emptyStateTitle = computed(() => {
  return productStore.productCount === 0
    ? "目前沒有商品"
    : "找不到符合條件的商品"
})

// EmptyState 說明
const emptyStateMessage = computed(() => {
  return productStore.productCount === 0
    ? "目前尚未提供商品，請稍後再回來查看。"
    : "請嘗試更換搜尋文字、商品分類或排序方式。"
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

// 重新載入商品
const handleRetry = () => {
  productStore.fetchProducts({
    force: true,
  })
}

// State 改變時同步至 Query
watch(
  [
    searchKeyword,
    selectCategory,
    selectSort,
  ],

  () => {
    // 商品尚未載入時，不驗證分類
    if (!productStore.hasLoaded) {
      return
    }

    const queryFromState =
      getQueryFromState({
        searchKeyword:
          searchKeyword.value,

        selectCategory:
          selectCategory.value,

        selectSort:
          selectSort.value,
      })

    if (
      isSameQuery(
        route.query,
        queryFromState,
      )
    ) {
      return
    }

    router.replace({
      query: queryFromState,
    })
  },
)

// Query 或商品分類改變時同步至 State
watch(
  [
    () => route.query,

    // API 完成後，hasLoaded 會改成 true
    () => productStore.hasLoaded,

    // 商品分類內容改變時重新驗證 Query
    () => categoryArray.value.join("|"),
  ],

  () => {
    // 商品資料尚未成功取得
    if (!productStore.hasLoaded) {
      return
    }

    const safeState =
      getSafeStateFromQuery()

    const safeQuery =
      getQueryFromState(safeState)

    // Query 不乾淨時，先修正網址
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

    // Query 已安全，才同步至畫面
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

// 元件第一次掛載後取得商品
onMounted(() => {
  productStore.fetchProducts()
})
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
          目前共有

          <strong>
            {{
              productStore.hasLoaded
                ? productStore.productCount
                : "..."
            }}
          </strong>

          項商品
        </p>
      </header>

      <LoadingState
        v-if="productStore.isLoading"
        title="商品載入中"
        message="正在取得最新商品資料，請稍候。"
      />

      <ErrorState
        v-else-if="
          productStore.errorMessage
        "
        title="商品讀取失敗"
        :message="
          productStore.errorMessage
        "
        retry-text="重新載入商品"
        @retry="handleRetry"
      />

      <template v-else>
        <div class="search-bar">
          <input
            v-model="searchKeyword"
            type="search"
            aria-label="搜尋商品"
            placeholder="搜尋商品名稱、分類或說明"
          >

          <select
            v-model="selectCategory"
            aria-label="選擇商品分類"
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

          <select
            v-model="selectSort"
            aria-label="選擇排序方式"
          >
            <option value="default">
              預設排序
            </option>

            <option value="inc">
              價格由高至低
            </option>

            <option value="dec">
              價格由低至高
            </option>
          </select>

          <button
            type="button"
            @click="resetSearch"
          >
            重置搜尋選項
          </button>
        </div>

        <EmptyState
          v-if="
            showProducts.length === 0
          "
          :title="emptyStateTitle"
          :message="emptyStateMessage"
        >
          <template #icon>
            🔍
          </template>

          <template
            v-if="
              productStore.productCount > 0
            "
            #action
          >
            <button
              type="button"
              class="empty-reset-button"
              @click="resetSearch"
            >
              清除搜尋條件
            </button>
          </template>
        </EmptyState>

        <ul
          v-else
          class="product-list"
        >
          <ProductCard
            v-for="product in showProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="
              handleAddToCart
            "
          />
        </ul>
      </template>
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

.section-label {
  margin: 0 0 12px;
  color: #0f766e;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.section-heading h1 {
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

/* 搜尋、分類與排序工具列 */
.search-bar {
  display: grid;
  grid-template-columns:
    minmax(240px, 2fr)
    minmax(150px, 1fr)
    minmax(170px, 1fr)
    auto;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  box-shadow:
    0 12px 30px
    rgb(15 23 42 / 8%);
}

/* 防止 Grid 子元素將版面撐開 */
.search-bar > * {
  min-width: 0;
}

/* 搜尋框及下拉選單 */
.search-bar input,
.search-bar select {
  width: 100%;
  min-height: 46px;
  padding: 11px 14px;
  color: #0f172a;
  font: inherit;
  font-weight: 600;
  background-color: #ffffff;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.search-bar input::placeholder {
  color: #64748b;
}

.search-bar input:hover,
.search-bar select:hover {
  border-color: #475569;
}

.search-bar input:focus,
.search-bar select:focus {
  border-color: #0f766e;
  outline: none;
  box-shadow:
    0 0 0 4px
    rgb(20 184 166 / 20%);
}

/* 重置搜尋按鈕 */
.search-bar > button {
  min-height: 46px;
  padding: 11px 18px;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  white-space: nowrap;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.search-bar > button:hover {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.search-bar > button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

/* 商品列表 */
.product-list {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(260px, 1fr)
    );
  gap: 24px;
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
}

/* EmptyState 插槽內的重置按鈕 */
.empty-reset-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  color: #ffffff;
  font: inherit;
  font-weight: 900;
  background-color: #0f766e;
  border: 1px solid #0f766e;
  border-radius: 11px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.empty-reset-button:hover {
  background-color: #115e59;
  border-color: #115e59;
  transform: translateY(-2px);
}

.empty-reset-button:focus-visible {
  outline: 3px solid #5eead4;
  outline-offset: 3px;
}

/* 平板版 */
@media (max-width: 900px) {
  .search-bar {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .search-bar > input,
  .search-bar > button {
    grid-column: 1 / -1;
  }
}

/* 手機版 */
@media (max-width: 600px) {
  .product-page {
    padding: 48px 16px 64px;
  }

  .search-bar {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 32px;
    padding: 20px;
  }

  .search-bar > input,
  .search-bar > select,
  .search-bar > button {
    grid-column: 1 / -1;
  }

  .search-bar > button {
    width: 100%;
  }

  .product-list {
    grid-template-columns: 1fr;
    margin-top: 32px;
  }
}

/* 尊重使用者的減少動態效果設定 */
@media (prefers-reduced-motion: reduce) {
  .search-bar input,
  .search-bar select,
  .search-bar > button,
  .empty-reset-button {
    transition: none;
  }

  .search-bar > button:hover,
  .empty-reset-button:hover {
    transform: none;
  }
}
</style>