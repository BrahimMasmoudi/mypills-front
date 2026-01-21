import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import type { GetMedicationDetailsResponse } from '~/types/api'

export const useTunisianMedicationsStore = defineStore('tunisianMedicationsStore', () => {
    const { $functions } = useNuxtApp()

    const searchTunisianMedications = async (query : string) => {
        const searchTunisianMeds = httpsCallable($functions, 'searchTunisianMeds')
        const result = await searchTunisianMeds({ query })
        return result.data as GetMedicationDetailsResponse[] ?? []
    }

    return {
        searchTunisianMedications,
    }
})
