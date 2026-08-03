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
        path:"/orders",
        name:"orders",
        component:OrdersView,

        meta:{
            requiresAuth: true,
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
      path:"/register",
      name:"register",
      component:RegisterView,

      meta:{
        guestOnly: true,
      }
    },
    {
        path:"/order-detail/:id",
        name:"order-detail",
        component:OrderDetailView,

        meta:{
            requiresAuth:true
        }
    },
    {
      path:"/:pathMatch(.*)*",
      component:NotFoundView
    }
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 需要登入，但目前尚未登入
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

  // 已登入的會員不可再次進入登入頁
  if (
    to.meta.guestOnly &&
    authStore.isLogin
  ) {
    return {
      name: "home",
    }
  }

  // 其他情況正常放行
  return true
})

export { router }