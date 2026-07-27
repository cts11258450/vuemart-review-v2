import { ref,computed, watch } from "vue"
import { defineStore } from "pinia"

export const useCartStore = defineStore("cart", ()=>{

    //initial state
    const getSaveCart = ()=>{
        try{
            const saveItem = localStorage.getItem("cart");
            const saveCart = saveItem? JSON.parse(saveItem) : [];
            return Array.isArray(saveCart) ? saveCart : [];
        }
        catch(error){
            console.error("解析錯誤",error);
            return [];
        }
    }

    //state
    const cart = ref(getSaveCart());

    //getter
    const totalQuantity = computed(()=>{
        return cart.value.reduce((total, cartItem)=>{
            return total + cartItem.qty
        },0)
    })
    const totalPrice = computed(()=>{
        return cart.value.reduce((total,cartItem)=>{
            return total + ( cartItem.qty * cartItem.price )
        },0)
    })

    //action
    const addToCart = (obj)=>{
        if (obj.stock <= 0) {
            return {
                success: false,
                message: `物品[${obj.name}]已沒有庫存!`
            }
        }
        const targetCartItem = cart.value.find((cartItem)=>{
            return cartItem.id === obj.id;
        });
        if(targetCartItem){
            if(targetCartItem.stock <= 0){
                return{
                    success:false,
                    message:`物品[${targetCartItem.name}]已沒有庫存!`
                };
            }
            if(targetCartItem.stock <= targetCartItem.qty ){
                return {
                    success:false,
                    message:`物品[${targetCartItem.name}]數量已達上限!`
                }
            }
            targetCartItem.qty++;
            return{
                success:true,
                message:`物品[${targetCartItem.name}]數量已更新!`
            }
        }
        const addToCartItem = {
            ...obj,
            qty:1
        }
        cart.value.unshift(addToCartItem);
        return{
            success:true,
            message:`已新增物品[${obj.name}]!`
        }
    }

    const deleteCartItem = (id)=>{
        cart.value = cart.value.filter((cartItem)=>{
            return cartItem.id !== id;
        })
    }

    const updateCartItemQty = (id, option)=>{
        const targetCartItem = cart.value.find((cartItem)=>{
            return cartItem.id === id;
        });
        if(!targetCartItem){
            return {
                success:false,
                message:`找不到該商品!`
            }
        }
        const newQty = targetCartItem.qty + option;
        if(newQty <= 0){
            deleteCartItem(id);
            return{
                success:true,
                message:`已刪除物品[${targetCartItem.name}]!`
            }
        }
        if(newQty > targetCartItem.stock){
            return {
                success:false,
                message:`物品[${targetCartItem.name}]數量已達上限!`
            }
        }
        targetCartItem.qty = newQty;
        return{
            success:true,
            message:`物品[${targetCartItem.name}]數量已更新!`
        }
       
    }

    const clearCart = () =>{
        if(cart.value === 0){
            return{
                success:false,
                message:"購物車目前沒有商品！"
            }
        }

        cart.value.length = 0;
        return{
            success:true,
            message:"購物車已清空！"
        }
    }

    //watch
    watch(cart,(newCart)=>{
        localStorage.setItem("cart",JSON.stringify(newCart));
    },{deep:true})

    return{
        //state
        cart,

        //getter
        totalQuantity,
        totalPrice,

        //action
        addToCart,
        deleteCartItem,
        updateCartItemQty,
        clearCart
    }
})