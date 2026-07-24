import { createRouter, createWebHashHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import CartView from "../views/CartView.vue"

export const router = createRouter({
    history: createWebHashHistory(),
    routes:[
        {
            path:"/",
            name:"home",
            component:HomeView
        },
        {
            path:"/cart",
            name:"cart",
            component:CartView
        }
    ]
})