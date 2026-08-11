import {
  createRouter,
  createWebHashHistory,
} from "vue-router"

import { useAuthStore } from "../stores/auth.js"

// ==================================================
// 路由懶載入
// ==================================================
//
// 原本的靜態載入：
//
// import HomeView from "../views/HomeView.vue"
//
// 會在網站第一次載入時，將各個頁面的程式一起放進
// 主要 JavaScript bundle。
//
// 改成動態 import() 後：
//
// const HomeView = () => {
//   return import("../views/HomeView.vue")
// }
//
// import() 會回傳 Promise。
// Vue Router 會在使用者第一次進入該頁面時，
// 才下載對應的 JavaScript 與 CSS chunk。
//
// 第一次載入完成後，瀏覽器與 Vue Router
// 會保留已載入的模組，不會在每次切換時重新下載。

// 前台頁面
const HomeView = () => {
  return import(
    "../views/HomeView.vue"
  )
}

const ProductView = () => {
  return import(
    "../views/ProductView.vue"
  )
}

const ProductDetailView = () => {
  return import(
    "../views/ProductDetailView.vue"
  )
}

const CartView = () => {
  return import(
    "../views/CartView.vue"
  )
}

const CheckoutView = () => {
  return import(
    "../views/CheckoutView.vue"
  )
}

// 訂單頁面
const OrderSuccessView = () => {
  return import(
    "../views/OrderSuccessView.vue"
  )
}

const OrdersView = () => {
  return import(
    "../views/OrdersView.vue"
  )
}

const OrderDetailView = () => {
  return import(
    "../views/OrderDetailView.vue"
  )
}

// 會員頁面
const LoginView = () => {
  return import(
    "../views/LoginView.vue"
  )
}

const RegisterView = () => {
  return import(
    "../views/RegisterView.vue"
  )
}

// 後台管理頁面
const AdminProductsView = () => {
  return import(
    "../views/AdminProductsView.vue"
  )
}

const AdminProductCreateView = () => {
  return import(
    "../views/AdminProductCreateView.vue"
  )
}

const AdminProductEditView = () => {
  return import(
    "../views/AdminProductEditView.vue"
  )
}

// 找不到頁面
const NotFoundView = () => {
  return import(
    "../views/NotFoundView.vue"
  )
}

// ==================================================
// 建立 Router
// ==================================================

const router = createRouter({
  // 使用 Hash Router。
  //
  // 網址會包含 #，例如：
  // /vuemart-review-v2/#/product
  //
  // GitHub Pages 不需要額外設定伺服器轉址，
  // 重新整理子頁面時也不會發生 404。
  history: createWebHashHistory(),

  routes: [
    // ==================================================
    // 前台路由
    // ==================================================

    {
      path: "/",
      name: "home",
      component: HomeView,
    },

    {
      path: "/product",
      name: "product",
      component: ProductView,
    },

    {
      path: "/product/:id",
      name: "product-detail",
      component: ProductDetailView,
    },

    {
      path: "/cart",
      name: "cart",
      component: CartView,

      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/checkout",
      name: "checkout",
      component: CheckoutView,

      meta: {
        requiresAuth: true,
      },
    },

    // ==================================================
    // 訂單路由
    // ==================================================

    {
      path: "/order-success/:id",
      name: "order-success",
      component: OrderSuccessView,

      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/orders",
      name: "orders",
      component: OrdersView,

      meta: {
        requiresAuth: true,
      },
    },

    {
      path: "/order-detail/:id",
      name: "order-detail",
      component: OrderDetailView,

      meta: {
        requiresAuth: true,
      },
    },

    // ==================================================
    // 後台路由
    // ==================================================

    {
      path: "/admin/products",
      name: "admin-products",
      component: AdminProductsView,

      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: "/admin/products/new",
      name: "admin-product-create",
      component: AdminProductCreateView,

      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: "/admin/products/:id/edit",
      name: "admin-product-edit",
      component: AdminProductEditView,

      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    // ==================================================
    // 會員路由
    // ==================================================

    {
      path: "/login",
      name: "login",
      component: LoginView,

      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/register",
      name: "register",
      component: RegisterView,

      meta: {
        guestOnly: true,
      },
    },

    // ==================================================
    // 404 路由
    // ==================================================
    //
    // 必須放在所有正常路由之後。
    // 無法匹配前面路由的網址，
    // 最後都會進入 NotFoundView。

    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
  ],
})

// ==================================================
// 全域路由守衛
// ==================================================

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 第一關：
  // 目標頁面需要登入，
  // 但使用者目前尚未登入。
  if (
    to.meta.requiresAuth &&
    !authStore.isLogin
  ) {
    return {
      name: "login",

      // 保留使用者原本想進入的網址。
      //
      // 登入成功後，可以讓使用者回到原本頁面。
      query: {
        redirect: to.fullPath,
      },
    }
  }

  // 第二關：
  // 目標頁面需要管理員權限，
  // 但目前登入者不是管理員。
  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: "home",
    }
  }

  // 第三關：
  // 已登入的使用者不應再次進入
  // 登入頁及註冊頁。
  if (
    to.meta.guestOnly &&
    authStore.isLogin
  ) {
    return {
      name: "home",
    }
  }

  // 通過所有檢查，允許進入目標路由。
  return true
})

export { router }