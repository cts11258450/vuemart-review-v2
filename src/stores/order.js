import {
  ref,
  computed,
  watch,
} from "vue"

import { defineStore } from "pinia"

import {
  createOrderApi,
} from "../api/orderApi.js"

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

    //複製訂單物件，items的陣列裡面所有物件
    const cloneItems = (items)=>{
      return items.map((item)=>{
        return {
          ...item
        }
      })
    }


    // state
    const orders = ref(
      getSavedOrders(),
    )

    const isCreatingOrder =
      ref(false)

    // getter
    const orderCount = computed(() => {
      return orders.value.length
    })

    // action：建立新訂單
    const createOrder =
      async (orderData) => {
        // 避免使用者連續送出
        if (isCreatingOrder.value) {
          return {
            success: false,
            message:
              "訂單正在建立中，請稍候。",
          }
        }

        isCreatingOrder.value = true

        try {
          // 準備送給 API 的訂單資料
          const orderPayload = {
            ...orderData,

            customer: {
              ...orderData.customer,
            },

            items: Array.isArray(
              orderData.items,
            )
              ? cloneItems(orderData.items)
              : [],

            status: "處理中",

            createdAt:
              new Date().toISOString(),
          }

          // 等待 JSON Server 建立訂單
          const createdOrder =
            await createOrderApi(
              orderPayload,
            )

          // API 成功後才更新 Pinia
          orders.value.unshift(
            createdOrder,
          )

          return {
            success: true,

            message:
              `訂單 ${createdOrder.id} 已成功建立！`,

            // 保留 newOrder 名稱，
            // 讓 CheckoutView 原本的程式較容易銜接
            newOrder: createdOrder,
          }
        } catch (error) {
          console.error(
            "訂單建立失敗：",
            error,
          )

          const message =
            error instanceof Error
              ? error.message
              : "訂單建立失敗，請稍後再試。"

          return {
            success: false,
            message,
            newOrder: null,
          }
        } finally {
          isCreatingOrder.value =
            false
        }
      }

    // action：根據訂單 ID 尋找訂單
    const getOrderById = (
      paramsId,
    ) => {
      return orders.value.find(
        (order) => {
          return (
            String(order.id) ===
            String(paramsId)
          )
        },
      )
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
      isCreatingOrder,

      // getter
      orderCount,

      // action
      createOrder,
      getOrderById,
    }
  },
)