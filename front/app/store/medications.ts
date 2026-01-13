import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions';
import type { Medication } from "~/types/medication";
import { collection, orderBy, query, where } from "firebase/firestore";
import { logEvent } from "@firebase/analytics";
import type { GetMedicationDetailsResponse } from "../types/api";

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const { $functions, $firestore, $analytics } = useNuxtApp()

    /* ------------------------------------------------------------------
     * STATE
     * ------------------------------------------------------------------ */
    const medications = ref<Medication[] | undefined>(undefined)

    /* ------------------------------------------------------------------
     * HELPERS
     * ------------------------------------------------------------------ */
    const ensureDate = (dateValue: any): Date => {
        if (!dateValue) return new Date(0)
        if (typeof dateValue.toDate === 'function') return dateValue.toDate()
        if (dateValue instanceof Date) return dateValue
        if (dateValue.seconds !== undefined) return new Date(dateValue.seconds * 1000)

        const date = new Date(dateValue)
        return isNaN(date.getTime()) ? new Date(0) : date
    }

    /* ------------------------------------------------------------------
     * FIRESTORE INIT (SYNC COMPOSABLE, ASYNC ACTION)
     * ------------------------------------------------------------------ */
    const initMedications = async () => {
        const user = await getCurrentUser()
        if (!user?.email) return

        const q = query(
            collection($firestore, 'medications'),
            where('email', '==', user.email),
            orderBy('expiryDate', 'desc')
        )

        const collectionRef = useCollection(q)

        watch(
            collectionRef,
            (value) => {
                medications.value = value as Medication[]
            },
            { immediate: true }
        )
    }

    /* ------------------------------------------------------------------
     * CLOUD FUNCTIONS
     * ------------------------------------------------------------------ */
    const createMedication = async (medication: Medication) => {
        const create = httpsCallable($functions, 'createMedication')
        const result = await create({ medication })

        $analytics &&
        logEvent($analytics, 'create_medication', {
            medication_name: medication.name,
            expiry_date: medication.expiryDate
        })

        return result
    }

    const incrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'incrementPills')
        const result = await increase({ medication })

        $analytics &&
        logEvent($analytics, 'increment_pills', {
            medication_name: medication.name,
            medication_id: medication.medicationId
        })

        return result
    }

    const decrementPills = async (medication: Medication) => {
        const decrease = httpsCallable($functions, 'decrementPills')
        const result = await decrease({ medication })

        $analytics &&
        logEvent($analytics, 'decrement_pills', {
            medication_name: medication.name,
            medication_id: medication.medicationId
        })

        return result
    }

    const deletePills = async (medication: Medication) => {
        const remove = httpsCallable($functions, 'deletePills')
        const result = await remove({ medication })

        $analytics &&
        logEvent($analytics, 'delete_medication', {
            medication_name: medication.name,
            medication_id: medication.medicationId
        })

        return result
    }

    const updateMedicationName = async (medication: Medication, newName: string) => {
        const update = httpsCallable($functions, 'updateMedicationName')
        const result = await update({ medication, newName })

        $analytics &&
        logEvent($analytics, 'update_medication_name', {
            old_name: medication.name,
            new_name: newName,
            medication_id: medication.medicationId
        })

        return result
    }

    /* ------------------------------------------------------------------
     * BUSINESS LOGIC
     * ------------------------------------------------------------------ */
    const checkAndUpdateExpiredMedications = async (list: Medication[]) => {
        const now = new Date()
        const expiredIds: string[] = []

        for (const med of list) {
            if (med.expired) continue

            const expiryDate = ensureDate(med.expiryDate)
            if (expiryDate < now) expiredIds.push(med.medicationId)
        }

        if (expiredIds.length > 0) {
            const setExpiredStatus = httpsCallable($functions, 'setExpiredStatus')
            await setExpiredStatus({ medicationIds: expiredIds })
        }
    }

    const getMedicationDetails = async (
        cip13: string
    ): Promise<GetMedicationDetailsResponse | undefined> => {
        const getDetails = httpsCallable($functions, 'getMedicationDetails')
        const result = await getDetails({ cip13 })
        return (result.data as GetMedicationDetailsResponse) || undefined
    }

    const findDuplicateMedication = (
        list: Medication[],
        name: string,
        expiryDate: Date
    ): Medication | null => {
        const targetMonth = expiryDate.getMonth()
        const targetYear = expiryDate.getFullYear()

        const duplicate = list.find(med => {
            const medDate = ensureDate(med.expiryDate)
            return (
                med.name.toLowerCase() === name.toLowerCase() &&
                medDate.getMonth() === targetMonth &&
                medDate.getFullYear() === targetYear
            )
        })

        duplicate &&
        $analytics &&
        logEvent($analytics, 'duplicate_medication_detected', {
            medication_name: name,
            existing_quantity: duplicate.quantity,
            expiry_date: expiryDate
        })

        return duplicate || null
    }

    const incrementPillsFromDuplicate = async (medication: Medication) => {
        $analytics &&
        logEvent($analytics, 'duplicate_medication_increment', {
            medication_name: medication.name,
            medication_id: medication.medicationId,
            new_quantity: medication.quantity + 1
        })

        return incrementPills(medication)
    }

    /* ------------------------------------------------------------------
     * EXPORT
     * ------------------------------------------------------------------ */
    return {
        medications,
        initMedications,

        createMedication,
        incrementPills,
        decrementPills,
        deletePills,
        updateMedicationName,
        checkAndUpdateExpiredMedications,
        getMedicationDetails,
        findDuplicateMedication,
        incrementPillsFromDuplicate
    }
})
