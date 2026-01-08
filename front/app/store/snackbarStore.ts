// stores/snackbar.ts
import {defineStore} from 'pinia'

export const useSnackbarStore = defineStore('snackbar', () => {
    const show = ref(false)
    const text = ref('')
    const title = ref('')
    const color = ref('primary')

    function notify(payload: { title: string, text: string }) {
        title.value = payload.title
        text.value = payload.text
        show.value = true
    }

    return {show, text, title, color, notify}
})