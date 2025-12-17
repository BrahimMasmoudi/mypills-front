import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions';
import type { Medication } from "~/types/medication";
import { collection, orderBy, query, where } from "firebase/firestore";
import type { User } from "@firebase/auth";
import { logEvent } from "@firebase/analytics";
import type { GetMedicationDetailsResponse } from "../types/api";

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const { $functions, $firestore, $analytics } = useNuxtApp()
    const getMedications = (user: User) => {
        const q = query(collection($firestore, 'medications'), orderBy('expiryDate', 'desc'), where('email', '==', user?.email))
        return useCollection(q)
    }

    const createMedication = async (medication: Medication) => {
        const create = httpsCallable($functions, 'createMedication')
        const result = await create({ medication })


        if ($analytics) {
            logEvent($analytics, 'create_medication', {
                medication_name: medication.name,
                expiry_date: medication.expiryDate
            })
        }
        return result
    }

    const incrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'incrementPills')
        const result = await increase({ medication })
        if ($analytics) {
            logEvent($analytics, 'increment_pills', {
                medication_name: medication.name,
                medication_id: medication.medicationId
            })
        }
        return result
    }
    const decrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'decrementPills')
        const result = await increase({ medication })

        if ($analytics) {
            logEvent($analytics, 'decrement_pills', {
                medication_name: medication.name,
                medication_id: medication.medicationId
            })
        }
        return result
    }
    const deletePills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'deletePills')
        const result = await increase({ medication })

        if ($analytics) {
            logEvent($analytics, 'delete_medication', {
                medication_name: medication.name,
                medication_id: medication.medicationId
            })
        }
        return result
    }

    const updateMedicationName = async (medication: Medication, newName: string) => {
        const update = httpsCallable($functions, 'updateMedicationName')
        const result = await update({ medication, newName })

        if ($analytics) {
            logEvent($analytics, 'update_medication_name', {
                old_name: medication.name,
                new_name: newName,
                medication_id: medication.medicationId
            })
        }
        return result
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
            const setExpiredStatus = httpsCallable($functions, 'setExpiredStatus')
            await setExpiredStatus({ medicationIds: expiredIds })
        }
    }

    const getMedicationDetails = async (cip13: string): Promise<GetMedicationDetailsResponse | undefined> => {
        const getDetails = httpsCallable($functions, 'getMedicationDetails')
        const result = await getDetails({ cip13 })
        return (result.data as GetMedicationDetailsResponse) || undefined
    }

    return {
        getMedications,
        createMedication,
        incrementPills,
        decrementPills,
        deletePills,
        updateMedicationName,
        checkAndUpdateExpiredMedications,
        getMedicationDetails
    }
})
