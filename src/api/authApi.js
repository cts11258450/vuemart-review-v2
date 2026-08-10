const API_BASE_URL =
  "http://localhost:3000"

// ==================================================
// 共用工具
// ==================================================

// 模擬網路延遲
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// 判斷是否為一般物件
const isObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
}

// 使用 JSON Server 查詢使用者
const findUserByEmail = async (email) => {
  const encodedEmail =
    encodeURIComponent(email)

  const response = await fetch(
    `${API_BASE_URL}/users?email=${encodedEmail}`,
  )

  if (!response.ok) {
    throw new Error(
      `查詢使用者失敗，狀態碼：${response.status}`,
    )
  }

  const usersArray =
    await response.json()

  if (!Array.isArray(usersArray)) {
    throw new TypeError(
      "查詢使用者 API 回傳格式錯誤",
    )
  }

  return usersArray[0] ?? null
}

// 使用本機會員陣列查詢使用者
const findUserByEmailWithoutJson = (
  email,
  localUsersArray,
) => {
  if (!Array.isArray(localUsersArray)) {
    return null
  }

  return (
    localUsersArray.find((user) => {
      return (
        String(user.email) ===
        String(email)
      )
    }) ?? null
  )
}

// 建立失敗結果
const createFailedResult = (message) => {
  return {
    success: false,
    message,
    user: null,
    source: null,
  }
}

// 建立成功結果
const createSuccessResult = (
  message,
  user,
  source,
) => {
  return {
    success: true,
    message,
    user: {
      ...user,
    },
    source,
  }
}

// ==================================================
// 註冊
// ==================================================

export const registerApi = async (
  registerData,
  localUsersArray = [],
) => {
  await delay(1000)

  let source = null
  let user = null

  if (import.meta.env.DEV) {
    const existingUser =
      await findUserByEmail(
        registerData.email,
      )

    if (existingUser) {
      return createFailedResult(
        "此帳號已註冊！",
      )
    }

    const payload = {
      ...registerData,
    }

    const response = await fetch(
      `${API_BASE_URL}/users`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      throw new Error(
        `註冊 API 發生錯誤，狀態碼：${response.status}`,
      )
    }

    const newRegisteredUser =
      await response.json()

    if (!isObject(newRegisteredUser)) {
      throw new TypeError(
        "註冊 API 回傳格式錯誤",
      )
    }

    user = {
      ...newRegisteredUser,
    }

    source = "json-server"
  } else {
    const existingUser =
      findUserByEmailWithoutJson(
        registerData.email,
        localUsersArray,
      )

    if (existingUser) {
      return createFailedResult(
        "此帳號已註冊！",
      )
    }

    user = {
      ...registerData,
      id: `demo-user-${registerData.email}`,
    }

    source = "local-storage"
  }

  return createSuccessResult(
    "註冊成功！",
    user,
    source,
  )
}

// ==================================================
// 登入
// ==================================================

export const loginApi = async (
  loginData,
  localUsersArray = [],
) => {
  await delay(1000)

  let source = null
  let existingUser = null

  if (import.meta.env.DEV) {
    existingUser =
      await findUserByEmail(
        loginData.email,
      )

    source = "json-server"
  } else {
    existingUser =
      findUserByEmailWithoutJson(
        loginData.email,
        localUsersArray,
      )

    source = "local-storage"
  }

  if (!existingUser) {
    return createFailedResult(
      "此帳號尚未註冊。",
    )
  }

  if (
    String(existingUser.password) !==
    String(loginData.password)
  ) {
    return createFailedResult(
      "密碼錯誤。",
    )
  }

  // 登入成功後，不將密碼交給 Store
  const user = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role:
      existingUser.role ?? "customer",
  }

  return createSuccessResult(
    "登入成功！",
    user,
    source,
  )
}