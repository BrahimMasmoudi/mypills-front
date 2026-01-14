export type QueueToastType = 'success' | 'error' | 'canceled'

export interface ToastItem {
    id: number
    message: string
    type: QueueToastType
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export const useQueueToast = () => {
    const addToast = (type: QueueToastType, message: string) => {
        const id = nextId++
        toasts.value.unshift({ id, message, type })
    }

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return {
        toasts,
        addToast,
        removeToast
    }
}