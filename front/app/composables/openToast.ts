import Toast from '~/components/molecules/Toast.vue'

export type ToastType = 'success' | 'error' | 'canceled' | 'warning'
export const openToast = (toastType: ToastType, message: string) => {
    const { $open } = useNuxtApp()
    setTimeout(() => {
        $open<any>(Toast, {
            scrim: false,
            isPersistent: false,
            message,
            toastType,
        })
    }, 400)
}
