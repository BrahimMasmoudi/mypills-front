import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { CreateMedicationUseCase } from '../../../ports/input/medication/create-medication-use-case'
import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

export class CreateMedication implements CreateMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication, auth: AuthData): Promise<void> {
        const existingMedication = await this.medicationRepo.get(medication.medicationId, auth)

        if (existingMedication) {
            const unitsPerBox = medication.unitsPerBox ?? existingMedication.unitsPerBox
            const addedBoxes = medication.numberOfBoxes || 1

            if (unitsPerBox) {
                const quantityToAdd = unitsPerBox * addedBoxes
                const newQuantity = (existingMedication.quantity || 0) + quantityToAdd
                const newNumberOfBoxes = Math.ceil(newQuantity / unitsPerBox)

                await this.medicationRepo.update(existingMedication, auth, 'quantity', newQuantity)
                await this.medicationRepo.update(existingMedication, auth, 'numberOfBoxes', newNumberOfBoxes)
                await this.medicationRepo.update(existingMedication, auth, 'unitsPerBox', unitsPerBox)
            } else {
                const newNumberOfBoxes = (existingMedication.numberOfBoxes || 0) + addedBoxes
                await this.medicationRepo.update(existingMedication, auth, 'numberOfBoxes', newNumberOfBoxes)
            }
            await this.medicationRepo.update(existingMedication, auth, 'updatedAt', new Date())
        } else {
            const unitsPerBox = medication.unitsPerBox
            const addedBoxes = medication.numberOfBoxes || 1

            if (unitsPerBox) {
                medication.quantity = unitsPerBox * addedBoxes
            }
            // If unitsPerBox is undefined, we trust medication.quantity is set by caller or remains undefined

            await this.medicationRepo.create(medication, auth)
        }
    }
}
