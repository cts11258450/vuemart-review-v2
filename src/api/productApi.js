import { mockProducts } from "../data/mockProducts.js"

// 模擬網路請求是否失敗
// false：正常取得商品
// true：模擬 API 發生錯誤
const SHOULD_FAIL = false

// 模擬網路等待時間
const delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}

// 模擬 GET /products
export const getProductsApi = async () => {
  // 模擬等待後端回應
  await delay(1000)

  // 模擬伺服器錯誤
  if (SHOULD_FAIL) {
    throw new Error(
      "商品資料載入失敗，請稍後再試。",
    )
  }

  // 模擬 API 回傳的新資料
  return mockProducts.map((product) => {
    return {
      ...product,
    }
  })
}