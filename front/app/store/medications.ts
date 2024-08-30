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

    return {
        getMedications,
        createMedication
    }
})
