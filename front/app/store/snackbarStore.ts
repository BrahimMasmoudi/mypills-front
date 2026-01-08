// stores/snackbar.ts
import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', () => {
    const show = ref(false)
    const text = ref('')
    const title = ref('')
    const color = ref('info') // 'success', 'error', 'primary', etc.

    function notify(payload: any) {
        // Handle both 'notification' and 'data' payloads
        title.value = payload.notification?.title || payload.data?.title || 'New Message'
        text.value = payload.notification?.body || payload.data?.body || ''

        // Optional: Custom logic based on payload data
        color.value = payload.data?.type === 'urgent' ? 'red' : 'primary'

        show.value = true
    }

    return { show, text, title, color, notify }
})