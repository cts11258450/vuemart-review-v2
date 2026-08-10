import { mockProducts } from "../data/mockProducts.js"

// JSON Server 的基礎網址
const API_BASE_URL =
  "http://localhost:3000"

// ==================================================
// 內部工具：模擬網路延遲
// ==================================================

const delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}

// ==================================================
// 內部工具：複製商品陣列
// ==================================================

// 這是淺層複製。
// 如果商品裡還有巢狀物件，
// 巢狀物件仍然會共用參考。
const cloneProducts = (products) => {
  return products.map((product) => {
    return {
      ...product,
    }
  })
}

// ==================================================
// 內部工具：判斷是否為非陣列物件
// ==================================================

// 排除：
// null、字串、數字、Boolean、陣列。
const isNonArrayObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
}

// ==================================================
// 內部工具：統一商品名稱格式
// ==================================================

// 這個格式只用於名稱比較。
//
// 例如：
// "  Gaming Keyboard  "
// 轉換成：
// "gaming keyboard"
//
// 實際儲存時仍會保留原本大小寫。
const normalizeProductName = (name) => {
  return typeof name === "string"
    ? name.trim().toLowerCase()
    : ""
}

// ==================================================
// 內部工具：驗證商品名稱
// ==================================================

const validateProductName = (name) => {
  // 型別不正確
  if (typeof name !== "string") {
    throw new TypeError(
      "商品名稱必須是字串。",
    )
  }

  const normalizedName =
    normalizeProductName(name)

  // 字串只包含空白
  if (!normalizedName) {
    throw new Error(
      "商品名稱不可為空白。",
    )
  }

  return normalizedName
}

// ==================================================
// 內部工具：尋找相同名稱的商品
// ==================================================

const findProductByName = async (
  name,

  // 編輯商品時可以傳入目前商品 ID，
  // 避免商品和自己比較後被判斷為重複。
  excludedProductId = null,
) => {
  const normalizedName =
    normalizeProductName(name)

  if (!normalizedName) {
    return null
  }

  let products = []

  if (import.meta.env.DEV) {
    // 開發環境從 JSON Server
    // 取得最新商品資料。
    const response = await fetch(
      `${API_BASE_URL}/products`,
    )

    if (!response.ok) {
      throw new Error(
        `檢查商品失敗，狀態碼：${response.status}`,
      )
    }

    products = await response.json()

    if (!Array.isArray(products)) {
      throw new TypeError(
        "商品 API 回傳的資料格式不正確。",
      )
    }
  } else {
    // 正式環境目前使用本地模擬商品。
    products =
      cloneProducts(mockProducts)
  }

  const existingProduct =
    products.find((product) => {
      // 排除商品陣列中的非法資料
      if (!isNonArrayObject(product)) {
        return false
      }

      const hasSameName =
        normalizeProductName(
          product.name,
        ) === normalizedName

      // null 和 undefined 代表
      // 沒有需要排除的商品 ID。
      const hasExcludedProductId =
        excludedProductId !== null &&
        excludedProductId !== undefined

      // 判斷目前商品是不是
      // 正在編輯的商品本身。
      const isExcludedProduct =
        hasExcludedProductId &&
        String(product.id) ===
          String(excludedProductId)

      // 名稱相同，而且不是商品自己，
      // 才視為名稱重複。
      return (
        hasSameName &&
        !isExcludedProduct
      )
    })

  // find() 找不到時會回傳 undefined，
  // 這裡統一轉成 null。
  return existingProduct ?? null
}

// ==================================================
// API：取得全部商品
// ==================================================

export const fetchProductsApi =
  async () => {
    await delay(800)

    if (import.meta.env.DEV) {
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
        throw new TypeError(
          "商品 API 回傳的資料格式不正確。",
        )
      }

      return products
    }

    // 正式環境尚未連接真正後端，
    // 暫時回傳模擬資料的複製版本。
    return cloneProducts(mockProducts)
  }

// ==================================================
// API：建立商品
// ==================================================

export const createProductApi =
  async (productData) => {
    await delay(800)

    // 先確認資料是物件，
    // 才能安全讀取 productData.name。
    if (
      !isNonArrayObject(productData)
    ) {
      throw new TypeError(
        "新增商品的資料格式不正確。",
      )
    }

    // 驗證名稱格式。
    // 若不合法，函式會直接 throw。
    validateProductName(
      productData.name,
    )

    // 新增商品不需要排除任何 ID。
    const existingProduct =
      await findProductByName(
        productData.name,
      )

    if (existingProduct) {
      throw new Error(
        "已經有相同名稱的商品。",
      )
    }

    // 實際儲存時只移除前後空白，
    // 不強制轉成小寫。
    const createPayload = {
      ...productData,

      name:
        productData.name.trim(),
    }

    if (import.meta.env.DEV) {
      const response = await fetch(
        `${API_BASE_URL}/products`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            createPayload,
          ),
        },
      )

      if (!response.ok) {
        throw new Error(
          `新增商品失敗，狀態碼：${response.status}`,
        )
      }

      const createdProduct =
        await response.json()

      if (
        !isNonArrayObject(
          createdProduct,
        )
      ) {
        throw new TypeError(
          "新增商品 API 回傳的資料格式不正確。",
        )
      }

      return createdProduct
    }

    // 正式環境暫時回傳模擬結果。
    return {
      ...createPayload,

      id: String(Date.now()),
    }
  }

// ==================================================
// API：更新商品
// ==================================================

export const updateProductApi =
  async (
    productId,
    productData,
  ) => {
    await delay(800)

    // 數字 0 仍可能是合法 ID，
    // 因此不可直接使用 if (!productId)。
    if (
      productId === null ||
      productId === undefined ||
      productId === ""
    ) {
      throw new TypeError(
        "缺少需要編輯的商品 ID。",
      )
    }

    if (
      !isNonArrayObject(productData)
    ) {
      throw new TypeError(
        "更新商品的資料格式不正確。",
      )
    }

    validateProductName(
      productData.name,
    )

    // 排除目前正在編輯的商品，
    // 避免名稱未變時被判斷為重複。
    const existingProduct =
      await findProductByName(
        productData.name,
        productId,
      )

    if (existingProduct) {
      throw new Error(
        "該商品正在編輯。",
      )
    }

    const updatePayload = {
      ...productData,

      name:
        productData.name.trim(),
    }

    if (import.meta.env.DEV) {
      // 將 ID 轉成安全的網址片段。
      const encodedId =
        encodeURIComponent(
          String(productId),
        )

      const response = await fetch(
        `${API_BASE_URL}/products/${encodedId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            updatePayload,
          ),
        },
      )

      if (!response.ok) {
        if (
          response.status === 404
        ) {
          throw new Error(
            "找不到需要編輯的商品。",
          )
        }

        throw new Error(
          `更新商品失敗，狀態碼：${response.status}`,
        )
      }

      const updatedProduct =
        await response.json()

      if (
        !isNonArrayObject(
          updatedProduct,
        )
      ) {
        throw new TypeError(
          "更新商品 API 回傳的資料格式不正確。",
        )
      }

      return updatedProduct
    }

    // 正式環境暫時回傳模擬結果。
    // id 放在最後，避免 productData.id
    // 覆蓋真正的商品 ID。
    return {
      ...updatePayload,

      id: productId,
    }
  }

// ==================================================
// API：刪除商品
// ==================================================

export const deleteProductApi =
  async (productId) => {
    await delay(800)

    // 不可直接寫 if (!productId)，
    // 因為數字 0 仍可能是合法 ID。
    if (
      productId === null ||
      productId === undefined ||
      productId === ""
    ) {
      throw new TypeError(
        "缺少需要刪除的商品 ID。",
      )
    }

    if (import.meta.env.DEV) {
      // 將 ID 轉換成安全的網址片段
      const encodedId =
        encodeURIComponent(
          String(productId),
        )

      const response = await fetch(
        `${API_BASE_URL}/products/${encodedId}`,
        {
          method: "DELETE",
        },
      )

      if (!response.ok) {
        if (
          response.status === 404
        ) {
          throw new Error(
            "找不到需要刪除的商品。",
          )
        }

        throw new Error(
          `刪除商品失敗，狀態碼：${response.status}`,
        )
      }

      // 不依賴 DELETE API 的回傳 body。
      //
      // 有些後端會回傳被刪除的物件，
      // 有些後端則回傳 204 No Content。
      // 因此這裡自行回傳統一格式。
      return {
        id: productId,
      }
    }

    // 正式環境尚未連接真正後端，
    // 暫時回傳模擬刪除結果。
    return {
      id: productId,
    }
  }