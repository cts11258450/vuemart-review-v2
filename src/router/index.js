import { createRouter, createWebHashHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProductView from "../views/ProductView.vue"
import CartView from "../views/CartView.vue"
import CheckoutView from "../views/CheckoutView.vue"
import OrderSuccessView from "../views/OrderSuccessView.vue"

export const router = createRouter({
    history: createWebHashHistory(),
    routes:[
        {
            path:"/",
            name:"home",
            component:HomeView
        },
        {
            path:"/product",
            name:"product",
            component:ProductView
        },
        {
            path:"/cart",
            name:"cart",
            component:CartView
        },
        {
            path:"/checkout",
            name:"CheckoutView",
            component:CheckoutView
        },
        {
            path:"/order-success/:id",
            name:"order-success",
            component:OrderSuccessView
        }
    ]
})