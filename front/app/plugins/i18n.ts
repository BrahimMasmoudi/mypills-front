import { createI18n, type Composer } from 'vue-i18n'
import fr from '../locales/fr.json'
import en from '../locales/en.json'

declare module '#app' {
    interface NuxtApp {
        $i18n: Composer
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        messages: { fr, en },
        locale: import.meta.client ? navigator.language.split('-')[0] : 'fr',
        fallbackLocale: 'fr',
        fallbackWarn: false,
        missingWarn: false,
    })

    nuxtApp.vueApp.use(i18n)
    nuxtApp.provide('i18n', i18n.global)
})
