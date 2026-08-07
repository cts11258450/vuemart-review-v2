import {
  createRouter,
  createWebHashHistory,
} from "vue-router"

import { useAuthStore } from "../stores/auth.js"

import HomeView from "../views/HomeView.vue"
import ProductView from "../views/ProductView.vue"
import ProductDetailView from "../views/ProductDetailView.vue"
import CartView from "../views/CartView.vue"
import CheckoutView from "../views/CheckoutView.vue"
import OrderSuccessView from "../views/OrderSuccessView.vue"
import LoginView from "../views/LoginView.vue"
import OrdersView from "../views/OrdersView.vue"
import OrderDetailView from "../views/OrderDetailView.vue"
import RegisterView from "../views/RegisterView.vue"
import AdminProductsView from "../views/AdminProductsView.vue"
import AdminProductCreateView from "../views/AdminProductCreateView.vue"
import AdminProductEditView from "../views/AdminProductEditView.vue"
import NotFoundView from "../views/NotFoundView.vue"

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
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
      path:"/admin/products/:id/edit",
      name:"admin-product-edit",
      component:AdminProductEditView,

      meta:{
        requiresAuth: true,
        requiresAdmin: true,
      }
    },
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
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 第一關：需要登入，但目前尚未登入
  if (
    to.meta.requiresAuth &&
    !authStore.isLogin
  ) {
    return {
      name: "login",

      query: {
        redirect: to.fullPath,
      },
    }
  }

  // 第二關：需要管理員權限，但目前不是管理員
  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: "home",
    }
  }

  // 第三關：已登入者不可進入登入及註冊頁面
  if (
    to.meta.guestOnly &&
    authStore.isLogin
  ) {
    return {
      name: "home",
    }
  }

  return true
})

export { router }