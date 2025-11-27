import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions';
import type { Medication } from "~/types/medication";
import { collection, orderBy, query, where } from "firebase/firestore";
import type { User } from "@firebase/auth";

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const { $functions, $firestore } = useNuxtApp()

    const getMedications = (user: User) => {
        const q = query(collection($firestore, 'medications'), orderBy('expiryDate', 'desc'), where('email', '==', user?.email))
        return useCollection(q)
    }

    const createMedication = async (medication: Medication) => {
        const create = httpsCallable($functions, 'createMedication')
        return await create({ medication })
    }

    const incrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'incrementPills')
        return await increase({ medication })
    }
    const decrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'decrementPills')
        return await increase({ medication })
    }
    const deletePills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'deletePills')
        return await increase({ medication })
    }

    const updateMedicationName = async (medication: Medication, newName: string) => {
        console.log(medication)
        console.log(newName)
        const update = httpsCallable($functions, 'updateMedicationName')
        return await update({ medication, newName })
    }

    const checkAndUpdateExpiredMedications = async (medications: Medication[]) => {
        const now = new Date()
        const expiredIds: string[] = []

        for (const med of medications) {
            // Skip if already marked as expired
            if (med.expired) continue

            const expiryDate = med.expiryDate instanceof Date
                ? med.expiryDate
                : new Date(med.expiryDate)

            if (expiryDate < now) {
                expiredIds.push(med.medicationId)
            }
        }

        if (expiredIds.length > 0) {
            console.log(`Found ${expiredIds.length} expired medications, updating...`)
            const updateExpired = httpsCallable($functions, 'updateExpiredStatus')
            await updateExpired({ medicationIds: expiredIds })
        }
    }

    return {
        getMedications,
        createMedication,
        incrementPills,
        decrementPills,
        deletePills,
        updateMedicationName,
        checkAndUpdateExpiredMedications
    }
})
