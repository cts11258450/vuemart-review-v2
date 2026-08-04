import { mockProducts } from "../data/mockProducts.js"

const API_BASE_URL =
  "http://localhost:3000"

// 模擬網路延遲，方便觀察 LoadingState
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// 複製商品，避免直接共用原始資料
const cloneProducts = (products) => {
  return products.map((product) => {
    return {
      ...product,
    }
  })
}

// 取得所有商品
export const fetchProductsApi =
  async () => {
    await delay(800)

    // 開發模式：使用 JSON Server
    if (import.meta.env.DEV) {
      console.log("1")
      const response = await fetch(
        `${API_BASE_URL}/products`,
      )

      if (!response.ok) {
        throw new Error(
          `商品資料讀取失敗，狀態碼：${response.status}`,
        )
      }

      const products =
        await response.json()

      if (!Array.isArray(products)) {
        throw new Error(
          "商品 API 回傳的資料格式不正確。",
        )
      }

      return products
    }

    // 正式環境：使用本地模擬資料
    return cloneProducts(mockProducts)
  }