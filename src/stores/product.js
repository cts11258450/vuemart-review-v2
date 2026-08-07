import {
  ref,
  computed,
} from "vue"

import { defineStore } from "pinia"

import {
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../api/productApi.js"

export const useProductStore =
  defineStore(
    "product",

    () => {
      // ==================================================
      // Helper：Store 內部工具
      // ==================================================

      // 判斷資料是否為非陣列物件
      const isNonArrayObject = (
        value,
      ) => {
        return (
          value !== null &&
          typeof value ===
            "object" &&
          !Array.isArray(value)
        )
      }

      // 統一取得錯誤訊息
      const getErrorMessage = (
        error,

        fallbackMessage =
          "商品操作失敗，請稍後再試。",
      ) => {
        return error instanceof Error
          ? error.message
          : fallbackMessage
      }

      // 根據商品 ID 尋找商品索引
      const findProductIndex = (
        productId,
      ) => {
        return products.value.findIndex(
          (product) => {
            return (
              String(product.id) ===
              String(productId)
            )
          },
        )
      }

      // ==================================================
      // State
      // ==================================================

      // 商品清單
      const products = ref([])

      // 是否正在取得商品資料
      const isLoading = ref(false)

      // 是否正在建立商品
      const isCreatingProduct =
        ref(false)

      // 是否正在更新商品
      const isUpdatingProduct =
        ref(false)

      // 是否正在刪除商品
      const isDeletingProduct =
        ref(false)

      // 商品讀取失敗訊息
      const errorMessage = ref("")

      // 是否至少成功取得過一次完整商品清單
      const hasLoaded = ref(false)

      // ==================================================
      // Getter
      // ==================================================

      // 商品總數
      const productCount = computed(
        () => {
          return products.value.length
        },
      )

      // 是否具有商品
      const hasProducts = computed(
        () => {
          return (
            products.value.length > 0
          )
        },
      )

      // ==================================================
      // Action：取得全部商品
      // ==================================================

      const fetchProducts =
        async (force = false) => {
          // 已經成功載入，而且沒有要求強制更新，
          // 就不重複發送 API 請求。
          if (
            hasLoaded.value &&
            !force
          ) {
            return {
              success: true,

              message:
                "目前已經有商品資料。",
            }
          }

          // 防止重複發送取得商品請求
          if (isLoading.value) {
            return {
              success: false,

              message:
                "商品正在載入中，請稍候。",
            }
          }

          isLoading.value = true
          errorMessage.value = ""

          try {
            const productData =
              await fetchProductsApi()

            products.value =
              productData.map(
                (product) => {
                  return {
                    ...product,
                  }
                },
              )

            // 只有取得完整商品清單成功，
            // 才將 hasLoaded 設為 true。
            hasLoaded.value = true

            return {
              success: true,

              message:
                "商品載入成功。",
            }
          } catch (error) {
            console.error(
              "商品載入失敗：",
              error,
            )

            const message =
              getErrorMessage(
                error,

                "商品載入失敗，請稍後再試。",
              )

            errorMessage.value =
              message

            hasLoaded.value = false

            return {
              success: false,
              message,
            }
          } finally {
            isLoading.value = false
          }
        }

      // ==================================================
      // Action：根據 ID 取得商品
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
      // Action：建立商品
      // ==================================================

      const createProduct =
        async (productData) => {
          // 防止連續點擊建立按鈕
          if (
            isCreatingProduct.value
          ) {
            return {
              success: false,

              message:
                "商品正在建立中，請稍候。",

              newProduct: null,
            }
          }

          if (
            !isNonArrayObject(
              productData,
            )
          ) {
            return {
              success: false,

              message:
                "新增商品的資料格式不正確。",

              newProduct: null,
            }
          }

          isCreatingProduct.value =
            true

          try {
            // 複製一份資料後再交給 API
            const createPayload = {
              ...productData,
            }

            const createdProduct =
              await createProductApi(
                createPayload,
              )

            // API 成功後才更新 Pinia。
            // 新商品放在陣列最前面。
            products.value.unshift({
              ...createdProduct,
            })

            // 這裡不設定 hasLoaded = true。
            // 因為建立一筆商品不代表
            // 已經取得完整商品清單。
            return {
              success: true,

              message:
                `商品「${createdProduct.name}」新增成功！`,

              newProduct: {
                ...createdProduct,
              },
            }
          } catch (error) {
            console.error(
              "商品新增失敗：",
              error,
            )

            const message =
              getErrorMessage(
                error,

                "商品新增失敗，請稍後再試。",
              )

            return {
              success: false,
              message,
              newProduct: null,
            }
          } finally {
            isCreatingProduct.value =
              false
          }
        }

      // ==================================================
      // Action：更新商品
      // ==================================================

      const updateProduct =
        async (
          productId,
          productData,
        ) => {
          // 防止連續點擊更新按鈕
          if (
            isUpdatingProduct.value
          ) {
            return {
              success: false,

              message:
                "商品正在更新中，請稍候。",

              updatedProduct: null,
            }
          }

          if (
            !isNonArrayObject(
              productData,
            )
          ) {
            return {
              success: false,

              message:
                "編輯商品的資料格式不正確。",

              updatedProduct: null,
            }
          }

          // API 更新前，先確認 Pinia
          // 是否具有這筆商品。
          //
          // 避免 API 已成功更新，
          // 才發現本機完全找不到商品。
          const currentProductIndex =
            findProductIndex(productId)

          if (
            currentProductIndex === -1
          ) {
            return {
              success: false,

              message:
                "本機找不到需要編輯的商品，請重新載入。",

              updatedProduct: null,
            }
          }

          isUpdatingProduct.value =
            true

          try {
            const updatePayload = {
              ...productData,
            }

            const updatedProduct =
              await updateProductApi(
                productId,
                updatePayload,
              )

            // API 等待期間，商品陣列仍可能改變，
            // 所以 API 成功後重新尋找一次索引。
            const latestProductIndex =
              findProductIndex(
                updatedProduct.id,
              )

            if (
              latestProductIndex === -1
            ) {
              // API 已經成功時，
              // 不應該再回報「更新失敗」。
              //
              // 本機找不到時，將更新後的商品
              // 補回商品清單。
              products.value.unshift({
                ...updatedProduct,
              })
            } else {
              products.value[
                latestProductIndex
              ] = {
                ...updatedProduct,
              }
            }

            return {
              success: true,

              message:
                `商品「${updatedProduct.name}」更新成功！`,

              updatedProduct: {
                ...updatedProduct,
              },
            }
          } catch (error) {
            console.error(
              "商品更新失敗：",
              error,
            )

            const message =
              getErrorMessage(
                error,

                "商品更新失敗，請稍後再試。",
              )

            return {
              success: false,
              message,
              updatedProduct: null,
            }
          } finally {
            isUpdatingProduct.value =
              false
          }
        }

      // ==================================================
      // Action：刪除商品
      // ==================================================

      const deleteProduct =
        async (productId) => {
          // 防止重複發送刪除請求
          if (
            isDeletingProduct.value
          ) {
            return {
              success: false,

              message:
                "商品正在刪除中，請稍候。",

              deletedProduct: null,
            }
          }

          // API 呼叫前先保存商品資料。
          // API 成功後，仍可使用商品名稱顯示訊息。
          const currentProduct =
            getProductById(productId)

          if (!currentProduct) {
            return {
              success: false,

              message:
                "本機找不到需要刪除的商品，請重新載入。",

              deletedProduct: null,
            }
          }

          isDeletingProduct.value =
            true

          try {
            const deleteResult =
              await deleteProductApi(
                productId,
              )

            const deletedProductId =
              deleteResult.id

            // API 成功後才從 Pinia 移除商品
            products.value =
              products.value.filter(
                (product) => {
                  return (
                    String(product.id) !==
                    String(
                      deletedProductId,
                    )
                  )
                },
              )

            return {
              success: true,

              message:
                `商品「${currentProduct.name}」刪除成功！`,

              deletedProduct: {
                ...currentProduct,
              },
            }
          } catch (error) {
            console.error(
              "商品刪除失敗：",
              error,
            )

            const message =
              getErrorMessage(
                error,

                "商品刪除失敗，請稍後再試。",
              )

            return {
              success: false,
              message,
              deletedProduct: null,
            }
          } finally {
            isDeletingProduct.value =
              false
          }
        }

      return {
        // State
        products,
        isLoading,
        isCreatingProduct,
        isUpdatingProduct,
        isDeletingProduct,
        errorMessage,
        hasLoaded,

        // Getter
        productCount,
        hasProducts,

        // Action
        fetchProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
      }
    },
  )