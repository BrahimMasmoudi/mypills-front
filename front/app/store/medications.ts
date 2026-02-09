import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import type { Medication } from '~/types/medication'
import { collection, orderBy, query, where } from 'firebase/firestore'
import { logEvent } from '@firebase/analytics'
import type { GetMedicationDetailsResponse } from '../types/api'
import { useCollection, getCurrentUser } from 'vuefire'
import { ref, computed } from 'vue'

export const useMedicationsStore = defineStore('medicationsStore', () => {
    const { $functions, $firestore, $analytics } = useNuxtApp()

    /* ------------------------------------------------------------------
     * STATE
     * ------------------------------------------------------------------ */
    const medications = ref<Medication[]>([])

    // The sourceQuery is the "trigger". useCollection watches this.
    const sourceQuery = ref<any>(null)

    // Setup the collection sync at the top level
    const collectionData = useCollection(() => sourceQuery.value, {
        target: medications,
    })

    /* ------------------------------------------------------------------
     * COMPUTED
     * ------------------------------------------------------------------ */
    const isLoading = computed(() => {
        // 1. If we haven't set a query yet, we are in the "pre-init" loading state
        if (!sourceQuery.value) return true
        // 2. Otherwise, return the actual Firestore pending status
        return collectionData.pending.value
    })

    /* ------------------------------------------------------------------
     * HELPERS
     * ------------------------------------------------------------------ */
    const ensureDate = (dateValue: any): Date => {
        if (!dateValue) return new Date(0)
        if (typeof dateValue.toDate === 'function') return dateValue.toDate()
        if (dateValue instanceof Date) return dateValue
        if (dateValue.seconds !== undefined) return new Date(dateValue.seconds * 1000)
        const date = new Date(dateValue)
        return Number.isNaN(date.getTime()) ? new Date(0) : date
    }

    /* ------------------------------------------------------------------
     * FIRESTORE INIT
     * ------------------------------------------------------------------ */
    const initMedications = async () => {
        const user = await getCurrentUser()
        if (!user?.email) return

        // Just updating this ref triggers the useCollection above
        sourceQuery.value = query(
            collection($firestore, 'medications'),
            where('email', '==', user.email)
        )
    }

    /* ------------------------------------------------------------------
     * CLOUD FUNCTIONS
     * ------------------------------------------------------------------ */
    const createMedication = async (medication: Medication) => {
        const create = httpsCallable($functions, 'createMedication')
        const result = await create({ medication })
        $analytics && logEvent($analytics, 'create_medication', {
            medication_name: medication.name,
            expiry_date: medication.expiryDate,
        })
        return result
    }

    const incrementPills = async (medication: Medication) => {
        const increase = httpsCallable($functions, 'incrementMedication')
        const result = await increase({ medication })
        $analytics && logEvent($analytics, 'increment_pills', {
            medication_name: medication.name,
            medication_id: medication.medicationId,
        })
        return result
    }

    const decrementPills = async (medication: Medication) => {
        const decrease = httpsCallable($functions, 'decrementMedication')
        const result = await decrease({ medication })
        $analytics && logEvent($analytics, 'decrement_pills', {
            medication_name: medication.name,
            medication_id: medication.medicationId,
        })
        return result
    }

    const deletePills = async (medication: Medication) => {
        const remove = httpsCallable($functions, 'deleteMedication')
        const result = await remove({ medication })
        $analytics && logEvent($analytics, 'delete_medication', {
            medication_name: medication.name,
            medication_id: medication.medicationId,
        })
        return result
    }

    const updateMedicationName = async (medication: Medication, newName: string) => {
        const update = httpsCallable($functions, 'updateMedication')
        const result = await update({
            medication,
            key: 'name',
            value: newName,
        })
        $analytics && logEvent($analytics, 'update_medication_name', {
            old_name: medication.name,
            new_name: newName,
            medication_id: medication.medicationId,
        })
        return result
    }

    /* ------------------------------------------------------------------
     * BUSINESS LOGIC
     * ------------------------------------------------------------------ */
    const checkAndUpdateExpiredMedications = async (list: Medication[]) => {
        const now = new Date()
        const expiredIds = list
            .filter(med => !med.expired && ensureDate(med.expiryDate) < now)
            .map(med => med.medicationId)

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

    const findDuplicateMedication = (list: Medication[], name: string, expiryDate: Date): Medication | null => {
        const targetMonth = expiryDate.getMonth()
        const targetYear = expiryDate.getFullYear()
        const duplicate = list.find((med) => {
            const medDate = ensureDate(med.expiryDate)
            return med.name.toLowerCase() === name.toLowerCase() &&
                medDate.getMonth() === targetMonth &&
                medDate.getFullYear() === targetYear
        })
        return duplicate || null
    }

    return {
        medications,
        isLoading,
        initMedications,
        createMedication,
        incrementPills,
        decrementPills,
        deletePills,
        updateMedicationName,
        checkAndUpdateExpiredMedications,
        getMedicationDetails,
        findDuplicateMedication,
    }
})