import {
  ref,
  computed,
  watch,
} from "vue"

import { defineStore } from "pinia"

export const useOrderStore = defineStore(
  "order",
  () => {
    // 從 localStorage 取得歷史訂單
    const getSavedOrders = () => {
      try {
        const savedItem =
          localStorage.getItem("orders")

        const savedOrders = savedItem
          ? JSON.parse(savedItem)
          : []

        return Array.isArray(savedOrders)
          ? savedOrders
          : []
      } catch (error) {
        console.error(
          "訂單資料解析失敗：",
          error,
        )

        return []
      }
    }

    // state
    const orders = ref(getSavedOrders())

    // getter
    const orderCount = computed(() => {
      return orders.value.length
    })

    // action：建立新訂單
    const createOrder = (orderData) => {
      const newOrder = {
        ...orderData,

        id: String(Date.now()),

        customer: {
          ...orderData.customer,
        },

        items: orderData.items.map((item) => {
          return {
            ...item,
          }
        }),

        status: "處理中",

        createdAt: new Date().toISOString(),
      }

      orders.value.unshift(newOrder)

      return {
        success: true,
        message: `訂單 ${newOrder.id} 已成功建立！`,
        newOrder,
      } 
    }

    // action：根據訂單 ID 尋找訂單
    const getOrderById = (paramsId) => {
      return orders.value.find((order) => {
        return String(order.id) === String(paramsId)
      })
    }

    // 訂單變動後保存至 localStorage
    watch(
      orders,
      (newOrders) => {
        localStorage.setItem(
          "orders",
          JSON.stringify(newOrders),
        )
      },
      {
        deep: true,
      },
    )

    return {
      // state
      orders,

      // getter
      orderCount,

      // action
      createOrder,
      getOrderById,
    }
  },
)
