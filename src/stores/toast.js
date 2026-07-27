import { ref } from "vue";
import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", ()=>{
    //state
    const messages = ref([]);
    let toastId = 0;

    //action
    const deleteToast = (id)=>{
        messages.value = messages.value.filter((item)=>{
            return item.id !== id;
        })
    }

    const showToast = (text, type = "success")=>{
        const id = toastId++;
        messages.value.unshift({
            id,
            text,
            type,
        })
        setTimeout(()=>{
            deleteToast(id);
        },3000)
    }

    return{
        //state
        messages,

        //action
        deleteToast,
        showToast
    }
})