import {createI18n, type I18n} from 'vue-i18n'
import fr from '../locales/fr.json'
import en from '../locales/en.json'

declare module '#app' {
    interface NuxtApp {
        $i18n: I18n
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        // @ts-ignore
        $i18n: I18n
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    const i18n = createI18n({
        globalInjection: true,
        messages: {fr, en},
        locale: navigator.language.split('-')[0],
        fallbackLocale: 'fr',
        fallbackWarn: false,
        missingWarn: false,
    })

    nuxtApp.vueApp.use(i18n)
    nuxtApp.provide('i18n', i18n.global)
})
