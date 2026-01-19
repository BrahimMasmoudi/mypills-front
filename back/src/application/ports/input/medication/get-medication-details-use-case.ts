import {GetMedicationDetailsResponse} from "../../../../types/medicationApi";
import {Cip13} from "../../../../types/cip13";

export interface GetMedicationDetailsUseCase {
    execute(
        cip13 : Cip13
    ): Promise<GetMedicationDetailsResponse>
}
