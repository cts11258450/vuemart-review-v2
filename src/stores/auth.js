import {
  ref,
  computed,
  watch,
} from "vue"

import { defineStore } from "pinia"

export const useAuthStore = defineStore(
  "auth",
  () => {
    // ==================================================
    // 初始化資料
    // ==================================================

    // 從 localStorage 取得已登入的使用者資料
    const getSavedUser = () => {
      try {
        // localStorage 取得的資料一定是字串或 null
        const savedItem =
          localStorage.getItem("user")

        // 如果有資料，就將 JSON 字串轉回 JavaScript 資料
        const savedUser = savedItem
          ? JSON.parse(savedItem)
          : null

        // 確認解析後的資料是一般物件
        if (
          savedUser !== null &&
          typeof savedUser === "object" &&
          !Array.isArray(savedUser)
        ) {
          return savedUser
        }

        // 資料格式不正確時，視為沒有登入
        return null
      } catch (error) {
        // JSON 格式錯誤時，JSON.parse() 會進入 catch
        console.error(
          "使用者資料解析錯誤：",
          error,
        )

        return null
      }
    }

    // 從 localStorage 取得登入 Token
    const getSavedToken = () => {
      const savedToken =
        localStorage.getItem("token")

      // 沒有 Token 時回傳空字串
      return savedToken || ""
    }

    // 從 localStorage 取得已註冊的會員資料
    const getSavedRegister = () => {
      try {
        const savedItem =
          localStorage.getItem("register")

        // localStorage 裡沒有註冊資料
        if (!savedItem) {
          console.log(
            "目前沒有使用者資料，已回傳空陣列。",
          )

          return []
        }

        // 先將 JSON 字串解析成 JavaScript 資料
        const parsedRegister =
          JSON.parse(savedItem)

        // 確認解析結果是陣列
        return Array.isArray(parsedRegister)
          ? parsedRegister
          : []
      } catch (error) {
        console.error(
          "註冊資料解析錯誤：",
          error,
        )

        // 發生錯誤時仍回傳陣列
        // 避免後面呼叫 .find() 時發生錯誤
        return []
      }
    }

    // ==================================================
    // 共用工具函式
    // ==================================================

    // 模擬 API 請求所需要的等待時間
    const delay = (milliseconds) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, milliseconds)
      })
    }

    // 驗證 email 格式
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    }

    // 統一 email 格式
    const normalizeEmail = (email) => {
      return typeof email === "string"
        ? email.trim().toLowerCase()
        : ""
    }

    // 統一密碼格式
    const normalizePassword = (password) => {
      return typeof password === "string"
        ? password
        : ""
    }

    // 統一使用者名稱格式
    const normalizeName = (name)=>{
        return typeof name === "string" ? name.trim() : ""
    }

    // ==================================================
    // 預設管理員資料
    // ==================================================

    const admin = {
      id: "demo-admin",
      name: "管理員",
      email: "test@gmail.com",
      password: "123456",
      role: "admin",
    }

    // ==================================================
    // State
    // ==================================================

    // 目前登入的使用者
    const user = ref(getSavedUser())

    // 目前登入的 Token
    const token = ref(getSavedToken())

    // 是否正在執行登入
    const isLoading = ref(false)

    // 是否正在執行註冊
    const isRegistering = ref(false)

    // 所有已註冊會員
    const registerDataBase = ref(
      getSavedRegister(),
    )

    // ==================================================
    // Getter
    // ==================================================

    // 同時具有使用者資料和 Token 才算登入
    const isLogin = computed(() => {
      return Boolean(
        token.value &&
        user.value,
      )
    })

    // 判斷目前登入的使用者是否為管理員
    const isAdmin = computed(() => {
      // user.value 可能是 null
      // 使用 ?. 可以避免讀取 null.role 而報錯
      return user.value?.role === "admin"
    })

    // ==================================================
    // Action：註冊
    // ==================================================

    const registerUser = async (
      registerData,
    ) => {
      // 先統一輸入資料的格式
      const currentUserEmail =
        normalizeEmail(registerData?.email)

      const currentUserPassword =
        normalizePassword(
          registerData?.password,
        )

      const currentUserName = normalizeName(registerData?.name)

      // 空值可以立即判斷，不必等待模擬 API
      if (
        !currentUserEmail ||
        !currentUserPassword ||
        !currentUserName
      ) {
        return {
          success: false,
          message: "帳號或密碼、使用者名稱不可為空。",
        }
      }

      //使用者名稱不得少於2個字元
      if(currentUserName.length < 2){
        return {
          success: false,
          message: "使用者名稱不得少於2個字元。",
        }
      }

      // 驗證統一格式後的 email
      if (!isValidEmail(currentUserEmail)) {
        return {
          success: false,
          message: "Email 格式不正確。",
        }
      }

      // password.length < 6 代表密碼至少需要 6 個字元
      if (currentUserPassword.length < 6) {
        return {
          success: false,
          message:
            "密碼長度至少需要 6 個字元。。",
        }
      }

      // 不允許註冊管理員預設帳號
      if (
        currentUserEmail === admin.email
      ) {
        return {
          success: false,
          message: "此帳號已被使用。",
        }
      }

      try {
        // 開始註冊，讓畫面可以顯示載入狀態
        isRegistering.value = true

        // 模擬 API 請求等待兩秒
        await delay(2000)

        // 尋找是否已經有相同 email
        const matchedResult =
          registerDataBase.value.find(
            (data) => {
              return (
                normalizeEmail(data.email) ===
                currentUserEmail
              )
            },
          )

        // 找到相同 email，代表重複註冊
        if (matchedResult) {
          return {
            success: false,
            message: "此帳號已重複註冊。",
          }
        }

        // 建立新的註冊會員資料
        const newRegisteredUser = {
          id:`demo-user-${currentUserEmail}`,
          name:"currentUserName",
          email: currentUserEmail,
          password: currentUserPassword,
          role: "customer",
        }

        // 將新會員加入註冊資料庫
        registerDataBase.value.push(
          newRegisteredUser,
        )

        return {
          success: true,
          message: "註冊成功！",
        }
      } catch (error) {
        console.error(
          "註冊失敗：",
          error,
        )

        // 統一回傳結果物件
        // 呼叫端不需要另外撰寫 try...catch
        return {
          success: false,
          message:
            "註冊時發生錯誤，請稍後再試。",
        }
      } finally {
        // 無論成功、失敗或提前 return，
        // finally 最後都會執行
        isRegistering.value = false
      }
    }

    // ==================================================
    // Action：登入
    // ==================================================

    const loginUser = async (loginData) => {
      // 統一登入資料格式
      const email = normalizeEmail(
        loginData?.email,
      )

      const password = normalizePassword(
        loginData?.password,
      )

      // 空值可以立即判斷，不必等待模擬 API
      if (!email || !password) {
        return {
          success: false,
          message:
            "請輸入電子信箱與密碼。",
        }
      }

      try {
        // 開始登入
        isLoading.value = true

        // 模擬 API 請求等待兩秒
        await delay(2000)

        // 判斷是否符合預設管理員帳號
        const matchedAdmin =
          email === admin.email &&
          password === admin.password

        if (matchedAdmin) {
          // 不建議把密碼存入目前登入的 user
          user.value = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          }

          token.value =
            "fake-token-admin"

          return {
            success: true,
            message:
              "登入成功！您是管理員。",
            user: user.value,
            token: token.value,
          }
        }

        // 從已註冊會員中尋找相符的帳號與密碼
        const matchedResult =
          registerDataBase.value.find(
            (data) => {
              return (
                normalizeEmail(data.email) ===
                  email &&
                data.password === password
              )
            },
          )

        // 找不到相符會員
        if (!matchedResult) {
          return {
            success: false,
            message: "帳號或密碼錯誤。",
          }
        }

        // 建立目前登入的使用者資料
        // 不將 password 放進登入狀態
        const loggedInUser = {
          id: matchedResult.id,
          name: matchedResult.name,
          email: matchedResult.email,
          role: matchedResult.role,
        }

        // 建立模擬 Token
        const newToken =
          `fake-token-${Date.now()}`

        user.value = loggedInUser
        token.value = newToken

        return {
          success: true,
          message: "登入成功！",
          user: loggedInUser,
          token: newToken,
        }
      } catch (error) {
        console.error(
          "登入錯誤：",
          error,
        )

        return {
          success: false,
          message:
            "登入時發生錯誤，請稍後再試。",
        }
      } finally {
        // 不論登入成功或失敗都關閉載入狀態
        isLoading.value = false
      }
    }

    // ==================================================
    // Action：登出
    // ==================================================

    const logout = () => {
      // 清除目前登入資料
      user.value = null
      token.value = ""

      return {
        success: true,
        message: "已成功登出。",
      }
    }

    // ==================================================
    // localStorage 同步
    // ==================================================

    // 使用者資料改變時同步 localStorage
    watch(
      user,
      (newUser) => {
        if (newUser) {
          localStorage.setItem(
            "user",
            JSON.stringify(newUser),
          )
        } else {
          localStorage.removeItem("user")
        }
      },
    )

    // Token 改變時同步 localStorage
    watch(
      token,
      (newToken) => {
        if (newToken) {
          localStorage.setItem(
            "token",
            newToken,
          )
        } else {
          localStorage.removeItem("token")
        }
      },
    )

    // 註冊資料改變時同步 localStorage
    watch(
      registerDataBase,
      (newRegister) => {
        if (newRegister.length !== 0) {
          localStorage.setItem(
            "register",
            JSON.stringify(newRegister),
          )
        } else {
          localStorage.removeItem(
            "register",
          )
        }
      },
      {
        // registerDataBase 是陣列
        // push() 修改的是陣列內部，因此需要 deep
        deep: true,
      },
    )

    // ==================================================
    // 對外提供的 Store 成員
    // ==================================================

    return {
      // state
      user,
      token,
      isLoading,
      isRegistering,

      // getter
      isLogin,
      isAdmin,

      // action
      registerUser,
      loginUser,
      logout,
    }
  },
)