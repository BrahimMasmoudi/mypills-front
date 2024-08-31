import {defineStore} from 'pinia'
import {httpsCallable} from 'firebase/functions';
import type {Medication} from "~/types/medication";
import {collection, orderBy, query} from "firebase/firestore";

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const {$functions, $firestore} = useNuxtApp()

    const getMedications = () => {
        const q = query(collection($firestore, 'medications'), orderBy('expiryDate', 'desc'))
        return useCollection(q)
    }

    const createMedication = async (medication: Medication) => {
        const create = httpsCallable($functions, 'createMedication')
        return await create({medication})
    }

    const incrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'incrementPills')
        return await increase({medication})
    }
    const decrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'decrementPills')
        return await increase({medication})
    }
    const deletePills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'deletePills')
        return await increase({medication})
    }

    return {
        getMedications,
        createMedication,
        incrementPills,
        decrementPills,
        deletePills
    }
})
