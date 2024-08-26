import {createI18n, type I18n} from 'vue-i18n'

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

const messages = {
    fr: {
        return: 'Retour',
        confirm: 'Valider',
        cancel: 'Annuler',
        select: 'Sélectionner',
    },
    en: {
        select: 'Select',
        confirm: 'Confirm',
        cancel: 'Cancel',
        return: 'Return',
    }
}

export default defineNuxtPlugin((app) => {
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        messages,
        locale: navigator.language.split('-')[0],
        fallbackLocale: 'fr',
        fallbackWarn: false,
        missingWarn: false,
    })
    app.vueApp.use(i18n)
    app.provide('i18n', i18n.global)
})
