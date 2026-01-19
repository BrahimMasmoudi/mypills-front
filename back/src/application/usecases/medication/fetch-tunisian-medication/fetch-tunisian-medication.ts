import { FetchTunisianMedicationUseCase } from '../../../ports/input/medication/fetch-tunisian-medication-use-case'
import { MedicationRepository } from '../../../../domain/repositories/medication-repository'
import { GetMedicationDetailsResponse } from '../../../../types/medicationApi'

export class FetchTunisianMedication implements FetchTunisianMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(query: string): Promise<(GetMedicationDetailsResponse & { id: string })[]> {
        return await this.medicationRepo.fetchTunisianMedications(query)
    }
}
