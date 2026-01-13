import {defineStore} from 'pinia'
import type {Country} from "~/types/country";

export const useCountryStore = defineStore('country', () => {
    const selectedCountry = useCookie<Country | null>('user-country', {
        maxAge: 60 * 60 * 24 * 30,
        watch: true,
        path: '/',
        sameSite: 'lax',
        default: () => null
    })

    const isFrance = computed(() => selectedCountry.value === 'FR')
    const isScanningReady = computed(() => isFrance.value)

    const confirmFrance = () => selectedCountry.value = 'FR'


    const clearCountry = () => {
        selectedCountry.value = 'OTHER'
    }

    return {
        selectedCountry,
        isFrance,
        isScanningReady,
        confirmFrance,
        clearCountry
    }
})
