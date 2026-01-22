export type QueueToastType = 'success' | 'error' | 'canceled'

export interface ToastItem {
    id: number
    message: string
    type: QueueToastType
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export const useQueueToast = () => {
    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    const addToast = (type: QueueToastType, message: string) => {
        const id = nextId++

        toasts.value.unshift({ id, message, type })

        // Auto-remove after 5000ms
        setTimeout(() => {
            removeToast(id)
        }, 10000)
    }

    return {
        toasts,
        addToast,
        removeToast,
    }
}