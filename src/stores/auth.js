import {
  ref,
  computed,
  watch,
} from "vue"

import { defineStore } from "pinia"

import {
  loginApi,
  registerApi,
} from "../api/authApi.js"

export const useAuthStore = defineStore(
  "auth",
  () => {
    // ==================================================
    // 初始化資料
    // ==================================================

    /**
     * 從 localStorage 取得目前登入的使用者。
     *
     * localStorage 只能儲存字串，因此需要使用
     * JSON.parse() 將 JSON 字串轉回 JavaScript 資料。
     */
    const getSavedUser = () => {
      try {
        // localStorage.getItem() 只會回傳字串或 null
        const savedItem =
          localStorage.getItem("user")

        // 有資料時解析 JSON；沒有資料時使用 null
        const savedUser = savedItem
          ? JSON.parse(savedItem)
          : null

        // 確認解析後的資料是一般物件，
        // 避免陣列、null 或其他錯誤格式被當成使用者
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
        // JSON 格式錯誤時，
        // JSON.parse() 會拋出錯誤並進入 catch
        console.error(
          "使用者資料解析錯誤：",
          error,
        )

        return null
      }
    }

    /**
     * 從 localStorage 取得登入 Token。
     *
     * 如果沒有 Token，localStorage.getItem()
     * 會回傳 null，因此統一轉成空字串。
     */
    const getSavedToken = () => {
      const savedToken =
        localStorage.getItem("token")

      return savedToken || ""
    }

    /**
     * 從 localStorage 取得本機註冊會員資料。
     *
     * 正式環境沒有 JSON Server，因此使用
     * registerDataBase 搭配 localStorage 模擬會員資料庫。
     */
    const getSavedRegister = () => {
      try {
        const savedItem =
          localStorage.getItem("register")

        // localStorage 裡沒有註冊資料時，
        // 回傳空陣列，讓後續可以安全使用 find()、unshift()
        if (!savedItem) {
          console.log(
            "目前沒有使用者資料，已回傳空陣列。",
          )

          return []
        }

        // 將 JSON 字串轉回 JavaScript 資料
        const parsedRegister =
          JSON.parse(savedItem)

        // 只有陣列才是正確的會員資料格式
        return Array.isArray(parsedRegister)
          ? parsedRegister
          : []
      } catch (error) {
        console.error(
          "註冊資料解析錯誤：",
          error,
        )

        // JSON 解析失敗時仍回傳空陣列，
        // 避免後續呼叫陣列方法時發生錯誤
        return []
      }
    }

    // ==================================================
    // 共用工具函式
    // ==================================================

    /**
     * 模擬非同步操作所需的等待時間。
     *
     * 目前主要用於管理員登入，
     * 讓畫面可以顯示登入中的 Loading 狀態。
     */
    const delay = (milliseconds) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, milliseconds)
      })
    }

    /**
     * 驗證 Email 的基本格式。
     *
     * 格式大致需要包含：
     * 一段文字 + @ + 網域名稱 + . + 頂級網域
     */
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    }

    /**
     * 統一 Email 格式。
     *
     * trim()：移除前後空白
     * toLowerCase()：統一轉成小寫
     *
     * 例如：
     * " Test@Gmail.com " → "test@gmail.com"
     */
    const normalizeEmail = (email) => {
      return typeof email === "string"
        ? email.trim().toLowerCase()
        : ""
    }

    /**
     * 統一密碼格式。
     *
     * 密碼有可能包含合法空白，因此這裡不使用 trim()。
     * 非字串資料則統一轉成空字串。
     */
    const normalizePassword = (password) => {
      return typeof password === "string"
        ? password
        : ""
    }

    /**
     * 統一使用者名稱格式。
     *
     * 移除使用者名稱前後多餘的空白。
     */
    const normalizeName = (name) => {
      return typeof name === "string"
        ? name.trim()
        : ""
    }

    /**
     * 統一取得錯誤訊息。
     *
     * 如果捕捉到的是 Error 物件，
     * 就使用 Error 物件本身的 message。
     *
     * 如果不是 Error 物件，
     * 則使用呼叫端提供的預設訊息。
     */
    const getErrorMessage = (
      error,
      message = "操作失敗，請稍後再試。",
    ) => {
      return error instanceof Error
        ? error.message
        : message
    }

    // ==================================================
    // 預設管理員資料
    // ==================================================

    /**
     * 教學專案使用的預設管理員帳號。
     *
     * 管理員帳號目前不儲存在 JSON Server，
     * 而是由 authStore 直接進行比對。
     *
     * 真實專案不應將管理員密碼直接寫在前端程式碼中。
     */
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
    // 沒有登入時為 null
    const user = ref(
      getSavedUser(),
    )

    // 目前登入使用者的模擬 Token
    // 沒有登入時為空字串
    const token = ref(
      getSavedToken(),
    )

    // 是否正在執行登入
    // LoginView 可以根據這個狀態停用登入按鈕
    const isLoading = ref(false)

    // 是否正在執行註冊
    // RegisterView 可以根據這個狀態停用註冊按鈕
    const isRegistering = ref(false)

    /**
     * 正式環境使用的本機會員資料庫。
     *
     * DEV：
     * 會員主要儲存在 db.json 的 users。
     *
     * PROD：
     * 沒有 JSON Server，因此將會員資料儲存在
     * registerDataBase，並同步到 localStorage。
     */
    const registerDataBase = ref(
      getSavedRegister(),
    )

    // ==================================================
    // Getter
    // ==================================================

    /**
     * 判斷目前是否已登入。
     *
     * 必須同時具有：
     * 1. 使用者資料
     * 2. Token
     *
     * Boolean() 會把判斷結果明確轉成 true 或 false。
     */
    const isLogin = computed(() => {
      return Boolean(
        token.value &&
        user.value,
      )
    })

    /**
     * 判斷目前登入者是否為管理員。
     *
     * user.value 可能是 null，
     * 使用 ?. 可以避免讀取 null.role 而發生錯誤。
     */
    const isAdmin = computed(() => {
      return (
        user.value?.role === "admin"
      )
    })

    // ==================================================
    // Action：註冊
    // ==================================================

    /**
     * 註冊會員。
     *
     * 整體流程：
     * 1. 統一輸入格式
     * 2. 驗證名稱、Email、密碼
     * 3. 建立 registerPayload
     * 4. 呼叫 registerApi()
     * 5. 正式環境將會員加入本機會員陣列
     * 6. 回傳註冊結果
     */
    const registerUser = async (
      registerData,
    ) => {
      // 統一 Email 格式
      const currentUserEmail =
        normalizeEmail(
          registerData?.email,
        )

      // 統一密碼格式
      const currentUserPassword =
        normalizePassword(
          registerData?.password,
        )

      // 統一使用者名稱格式
      const currentUserName =
        normalizeName(
          registerData?.name,
        )

      // 空值可以立即判斷，
      // 不需要進入 try 或等待 API
      if (
        !currentUserEmail ||
        !currentUserPassword ||
        !currentUserName
      ) {
        return {
          success: false,
          message:
            "帳號或密碼、使用者名稱不可為空。",
        }
      }

      // 使用者名稱至少需要兩個字元
      if (currentUserName.length < 2) {
        return {
          success: false,
          message:
            "使用者名稱不得少於2個字元。",
        }
      }

      // 驗證統一格式後的 Email
      if (!isValidEmail(currentUserEmail)) {
        return {
          success: false,
          message:
            "Email 格式不正確。",
        }
      }

      // 密碼至少需要六個字元
      if (
        currentUserPassword.length < 6
      ) {
        return {
          success: false,
          message:
            "密碼長度至少需要 6 個字元。",
        }
      }

      // 不允許使用者註冊預設管理員帳號
      if (
        currentUserEmail === admin.email
      ) {
        return {
          success: false,
          message:
            "此帳號已被使用。",
        }
      }

      try {
        // 開始註冊，讓 RegisterView
        // 可以顯示 Loading 並停用註冊按鈕
        isRegistering.value = true

        /**
         * 建立交給 API 的註冊資料。
         *
         * 一般註冊會員的角色固定為 customer，
         * 不接受表單自行指定 role，避免使用者
         * 透過表單將自己設定成管理員。
         */
        const registerPayload = {
          name: currentUserName,
          email: currentUserEmail,
          password: currentUserPassword,
          role: "customer",
        }

        /**
         * 將本機會員陣列一併傳給 API。
         *
         * DEV：
         * registerApi 會使用 JSON Server，
         * 不會使用 registerDataBase.value。
         *
         * PROD：
         * registerApi 會使用 registerDataBase.value
         * 檢查是否已經存在相同 Email。
         */
        const result = await registerApi(
          registerPayload,
          registerDataBase.value,
        )

        // API 回傳可預期的註冊失敗結果時，
        // 直接交給 RegisterView 顯示
        if (!result.success) {
          return result
        }

        const newRegisteredUser =
          result.user

        /**
         * 正式環境使用 localStorage 模擬會員資料庫。
         *
         * 只有資料來源為 local-storage 時，
         * 才需要手動加入 registerDataBase。
         *
         * DEV 的會員已由 JSON Server 寫入 db.json，
         * 因此不需要再存進 localStorage。
         */
        if (
          result.source ===
          "local-storage"
        ) {
          registerDataBase.value.unshift(
            newRegisteredUser,
          )
        }

        // 將 API 的成功結果交給 RegisterView
        return result
      } catch (error) {
        /**
         * registerApi() 如果拋出非預期錯誤，
         * 例如伺服器未啟動、網路中斷或格式錯誤，
         * 就會進入 catch。
         */
        console.error(
          "註冊失敗：",
          error,
        )

        const message = getErrorMessage(
          error,
          "註冊時發生錯誤，請稍後再試。",
        )

        // 統一回傳失敗結果，
        // 呼叫端不需要另外撰寫 try...catch
        return {
          success: false,
          message,
        }
      } finally {
        /**
         * 無論發生以下哪一種情況：
         * 1. 註冊成功
         * 2. API 回傳註冊失敗
         * 3. catch 捕捉到錯誤
         * 4. try 裡提前 return
         *
         * finally 最後都會執行。
         */
        isRegistering.value = false
      }
    }

    // ==================================================
    // Action：登入
    // ==================================================

    /**
     * 登入會員。
     *
     * 整體流程：
     * 1. 統一 Email 與密碼格式
     * 2. 檢查空值
     * 3. 開啟 Loading
     * 4. 判斷是否為預設管理員
     * 5. 一般會員交給 loginApi() 驗證
     * 6. 建立模擬 Token
     * 7. 保存登入使用者
     */
    const loginUser = async (
      loginData,
    ) => {
      // 統一登入 Email 格式
      const email = normalizeEmail(
        loginData?.email,
      )

      // 統一登入密碼格式
      const password = normalizePassword(
        loginData?.password,
      )

      // 空值可以立即判斷，
      // 不需要進入 try 或等待模擬登入
      if (!email || !password) {
        return {
          success: false,
          message:
            "請輸入電子信箱與密碼。",
        }
      }

      try {
        // 開始登入，讓 LoginView
        // 可以顯示 Loading 並停用登入按鈕
        isLoading.value = true

        /**
         * 保留原本的兩秒登入延遲。
         *
         * 管理員登入會等待約兩秒。
         * 一般會員進入 loginApi() 後，
         * 還會再加上 API 本身的模擬延遲。
         */
        await delay(2000)

        // 判斷是否符合預設管理員帳號及密碼
        const matchedAdmin =
          email === admin.email &&
          password === admin.password

        if (matchedAdmin) {
          /**
           * 登入狀態只保存畫面與權限判斷
           * 所需要的資料，不保存管理員密碼。
           */
          user.value = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          }

          // 建立教學用的管理員模擬 Token
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

        /**
         * 建立交給 loginApi() 的登入資料。
         *
         * 使用物件屬性簡寫：
         *
         * {
         *   email,
         *   password,
         * }
         *
         * 相當於：
         *
         * {
         *   email: email,
         *   password: password,
         * }
         */
        const loggedPayload = {
          email,
          password,
        }

        /**
         * 將本機會員資料一併傳給 API。
         *
         * DEV：
         * loginApi 會查詢 JSON Server。
         *
         * PROD：
         * loginApi 會查詢 registerDataBase.value。
         */
        const result = await loginApi(
          loggedPayload,
          registerDataBase.value,
        )

        // 帳號不存在或密碼錯誤時，
        // 直接將 API 的結果交給 LoginView
        if (!result.success) {
          return result
        }

        // 登入成功後建立教學用的模擬 Token
        const newToken =
          `fake-token-${Date.now()}`

        /**
         * loginApi 回傳的 result.user
         * 已經移除 password，因此可以保存為
         * 目前登入的使用者資料。
         */
        user.value = result.user
        token.value = newToken

        return {
          success: true,
          message: "登入成功！",
          user: result.user,
          token: newToken,
        }
      } catch (error) {
        /**
         * loginApi() 如果拋出非預期錯誤，
         * 例如伺服器未啟動、網路中斷或格式錯誤，
         * 就會進入 catch。
         */
        console.error(
          "登入錯誤：",
          error,
        )

        const message = getErrorMessage(
          error,
          "登入時發生錯誤，請稍後再試。",
        )

        return {
          success: false,
          message,
        }
      } finally {
        // 不論登入成功、登入失敗或發生錯誤，
        // 最後都關閉登入中的 Loading 狀態
        isLoading.value = false
      }
    }

    // ==================================================
    // Action：登出
    // ==================================================

    /**
     * 登出目前使用者。
     *
     * user 和 token 改變後，
     * 下方的 watch 會自動清除 localStorage。
     */
    const logout = () => {
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

    /**
     * 監聽目前登入的使用者。
     *
     * 有使用者：
     * 將使用者物件轉成 JSON 字串並保存。
     *
     * 沒有使用者：
     * 從 localStorage 移除 user。
     */
    watch(
      user,
      (newUser) => {
        if (newUser) {
          localStorage.setItem(
            "user",
            JSON.stringify(newUser),
          )
        } else {
          localStorage.removeItem(
            "user",
          )
        }
      },
    )

    /**
     * 監聽登入 Token。
     *
     * 有 Token：
     * 保存到 localStorage。
     *
     * 沒有 Token：
     * 從 localStorage 移除 token。
     */
    watch(
      token,
      (newToken) => {
        if (newToken) {
          localStorage.setItem(
            "token",
            newToken,
          )
        } else {
          localStorage.removeItem(
            "token",
          )
        }
      },
    )

    /**
     * 監聽正式環境的本機會員陣列。
     *
     * registerDataBase 是 ref 包住的陣列。
     * unshift() 修改的是陣列內部，而不是替換整個陣列，
     * 因此需要使用 deep: true 進行深層監聽。
     */
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
        deep: true,
      },
    )

    // ==================================================
    // 對外提供的 Store 成員
    // ==================================================

    return {
      // State
      user,
      token,
      isLoading,
      isRegistering,

      // Getter
      isLogin,
      isAdmin,

      // Action
      registerUser,
      loginUser,
      logout,
    }
  },
)