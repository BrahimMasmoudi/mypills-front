import {defineStore} from 'pinia'
import { httpsCallable } from 'firebase/functions';
import type {Medication} from "~/types/medications";

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const {$functions} = useNuxtApp()
    const medications = ref<Medication[]>()

    const getMedications = async () => {
        const fetchMedications = httpsCallable($functions, 'fetchMedications')
        const {data} = await fetchMedications()
        medications.value = data
        return data
    }

    return {
        getMedications,
    }
})
