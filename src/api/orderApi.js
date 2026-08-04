const API_BASE_URL =
  "http://localhost:3000"

// 模擬網路延遲
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// 建立訂單
export const createOrderApi =
  async (orderData) => {
    await delay(800)

    // 開發環境：寫入 JSON Server
    if (import.meta.env.DEV) {
      const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            orderData,
          ),
        },
      )

      if (!response.ok) {
        throw new Error(
          `訂單建立失敗，狀態碼：${response.status}`,
        )
      }

      const createdOrder =
        await response.json()

      if (
        createdOrder === null ||
        typeof createdOrder !== "object" ||
        Array.isArray(createdOrder)
      ) {
        throw new Error(
          "訂單 API 回傳的資料格式不正確。",
        )
      }

      return createdOrder
    }

    // 正式環境沒有 JSON Server，
    // 使用前端產生模擬訂單
    return {
      ...orderData,
      id: String(Date.now()),
    }
  }

