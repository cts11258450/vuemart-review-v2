import { ref, computed } from "vue"
import { defineStore } from "pinia"

import { mockProducts } from "../data/mockProducts"

export const useProductStore = defineStore("product",()=>{
    const products = ref(mockProducts);
    const productCount = computed(()=>{
        return products.value.length
    })

    return{
        products,
        productCount
    }
})