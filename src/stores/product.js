import {
  ref,
  computed,
} from "vue"

import { defineStore } from "pinia"

import {
  fetchProductsApi,
} from "../api/productApi.js"

export const useProductStore = defineStore(
  "product",
  () => {
    // ==================================================
    // State
    // ==================================================

    // 商品資料一開始為空
    const products = ref([])

    // 是否正在讀取商品
    const isLoading = ref(false)

    // 商品讀取失敗的訊息
    const errorMessage = ref("")

    // 是否至少成功讀取過一次商品
    const hasLoaded = ref(false)

    // ==================================================
    // Getter
    // ==================================================

    // 商品總數
    const productCount = computed(() => {
      return products.value.length
    })

    // 是否具有商品資料
    const hasProducts = computed(() => {
      return products.value.length > 0
    })

    // ==================================================
    // Action：取得商品資料
    // ==================================================

    const fetchProducts = async (
      options = {},
    ) => {
      // force 為 true 時，強制重新載入
      const force =
        options.force === true

      // 已經載入成功，而且沒有要求強制重載
      if (
        hasLoaded.value &&
        !force
      ) {
        return {
          success: true,
          message: "商品資料已經載入。",
          products: products.value,
          cached: true,
        }
      }

      // 避免同一時間重複發出請求
      if (isLoading.value) {
        return {
          success: false,
          message: "商品資料正在載入中。",
          skipped: true,
        }
      }

      try {
        // 開始載入
        isLoading.value = true

        // 清除上一次的錯誤
        errorMessage.value = ""

        // 呼叫模擬 API
        const response =
          await fetchProductsApi()

        // 防禦性檢查 API 回傳格式
        if (!Array.isArray(response)) {
          throw new Error(
            "商品資料格式不正確。",
          )
        }

        // 將 API 結果保存至 Store
        products.value = response

        // 標記至少成功載入過一次
        hasLoaded.value = true

        return {
          success: true,
          message: "商品資料載入成功。",
          products: response,
          cached: false,
        }
      } catch (error) {
        console.error(
          "商品資料載入錯誤：",
          error,
        )

        // Error 物件可以取得 message
        // 若不是 Error 物件，就使用預設訊息
        errorMessage.value =
          error instanceof Error
            ? error.message
            : "商品資料載入失敗，請稍後再試。"

        return {
          success: false,
          message: errorMessage.value,
        }
      } finally {
        // 成功、失敗或提前 return 後
        // 都要關閉 Loading
        isLoading.value = false
      }
    }

    // ==================================================
    // Action：根據 ID 尋找商品
    // ==================================================

    const getProductById = (
      productId,
    ) => {
      return products.value.find(
        (product) => {
          return (
            String(product.id) ===
            String(productId)
          )
        },
      )
    }

    // ==================================================
    // 對外提供
    // ==================================================

    return {
      // State
      products,
      isLoading,
      errorMessage,
      hasLoaded,

      // Getter
      productCount,
      hasProducts,

      // Action
      fetchProducts,
      getProductById,
    }
  },
)