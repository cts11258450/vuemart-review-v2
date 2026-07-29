import { ref, computed } from "vue"
import { defineStore } from "pinia"

import { mockProducts } from "../data/mockProducts"

export const useProductStore = defineStore("product",()=>{
    //state
    const products = ref(mockProducts);

    //getter
    const productCount = computed(()=>{
        return products.value.length
    })

    //actions
    const getProductById = (paramsId)=>{
        return products.value.find((product)=>{
            return String(product.id) === String(paramsId)
        })
    }

    return{
        //state
        products,

        //getter
        productCount,

        //actions
        getProductById
    }
})