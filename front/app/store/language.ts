import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

export const useLanguageStore = defineStore('language', () => {
    const { locale } = useI18n()

    // Create a cookie that lasts 30 days
    const savedLocale = useCookie<string>('user-locale', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        watch: true,
        default: () => 'en', // Default language if no cookie exists
    })

    // Sync the cookie value with vue-i18n on store initialization
    const initLocale = () => {
        if (savedLocale.value) {
            locale.value = savedLocale.value
        }
    }

    const switchLocale = (newLocale: string) => {
        console.log(newLocale)
        savedLocale.value = newLocale
        locale.value = newLocale
    }

    return {
        savedLocale,
        switchLocale,
        initLocale
    }
})