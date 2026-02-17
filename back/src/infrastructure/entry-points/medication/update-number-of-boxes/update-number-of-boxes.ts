import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { Medication } from '../../../../domain/entities/medication'

export const onMedicationUpdate = onDocumentWritten('medications/{medicationId}', async (event) => {
    if (!event.data) return

    const after = event.data.after.data() as Medication | undefined
    const before = event.data.before.data() as Medication | undefined

    if (!after) return // Document deleted

    const quantityChanged = before?.quantity !== after.quantity
    const unitsChanged = before?.unitsPerBox !== after.unitsPerBox

    if (!quantityChanged && !unitsChanged) return

    const units = after.unitsPerBox
    const quantity = after.quantity

    if (!units || units <= 0) return

    const newNumberOfBoxes = Math.ceil(quantity / units)

    if (after.numberOfBoxes === newNumberOfBoxes) return

    return event.data.after.ref.update({
        numberOfBoxes: newNumberOfBoxes,
        updatedAt: new Date()
    })
})
