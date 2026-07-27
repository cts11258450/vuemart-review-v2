import { useToastStore } from "../stores/toast.js";

export const handleShowToast = (result)=>{
    const toastStore = useToastStore();
    toastStore.showToast(result.message, result.success? "success" : "error")
}