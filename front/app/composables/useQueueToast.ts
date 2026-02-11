export type QueueToastType = 'success' | 'error' | 'canceled'

export interface ToastItem {
    id: number
    message: string
    type: QueueToastType
    actions?: { label: string, onClick: () => void }[]
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export const useQueueToast = () => {
    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    const addToast = (type: QueueToastType, message: string, actions?: { label: string, onClick: () => void }[]) => {
        const id = nextId++

        toasts.value.unshift({ id, message, type, actions })

        // Auto-remove after 10000ms
        setTimeout(() => {
            removeToast(id)
        }, 10000)

        return id
    }

    return {
        toasts,
        addToast,
        removeToast,
    }
}