import {defineStore} from 'pinia'
import {httpsCallable} from 'firebase/functions';
import type {Medication} from "~/types/medication";

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const {$functions} = useNuxtApp()
    const medications = ref<Medication[]>()

    const getMedications = async () => {
        const fetchMedications = httpsCallable($functions, 'fetchMedications')
        const {data} = await fetchMedications()
        medications.value = data
        return data
    }

    const createMedication = async (medication: Medication) => {
        const create = httpsCallable($functions, 'createMedication')
        return await create({medication})
    }

    return {
        getMedications,
        createMedication
    }
})
