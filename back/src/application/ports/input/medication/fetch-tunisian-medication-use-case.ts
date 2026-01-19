import { GetMedicationDetailsResponse } from '../../../../types/medicationApi'

export interface FetchTunisianMedicationUseCase {
    execute(
        query: string
    ): Promise<(GetMedicationDetailsResponse & { id: string })[]>
}
