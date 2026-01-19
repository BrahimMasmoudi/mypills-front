import {CisLookupRepository} from "../../../../domain/gateway/cis-lookup-repository";
import {MedicamentApiGateway} from "../../../../domain/gateway/medicament-api-gateway";
import {toMedicationDto} from "../../../../utils/mapper";
import {GetMedicationDetailsUseCase} from "../../../ports/input/medication/get-medication-details-use-case";
import {Cip13} from "../../../../types/cip13";

export class GetMedicationDetails implements GetMedicationDetailsUseCase {
    constructor(
        private readonly cisLookup: CisLookupRepository,
        private readonly apiGateway: MedicamentApiGateway
    ) {
    }

    async execute(cip13: Cip13) {
        const cis = await this.cisLookup.getCisByCip13(cip13)
        if (!cis) throw new Error('NOT_FOUND_IN_DB')

        const apiDetails = await this.apiGateway.fetchDetailsByCis(cis)

        const details = toMedicationDto(apiDetails)

        const name = apiDetails.elementPharmaceutique || ''

        return {
            name,
            cis: cis.getValue(),
            details,
        }
    }
}