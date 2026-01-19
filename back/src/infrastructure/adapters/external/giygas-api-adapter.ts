import {MedicamentApiGateway} from "../../../domain/gateway/medicament-api-gateway";
import {MedicamentResponse} from "../../../types/medicationApi";
import {Cis} from "../../../types/cis";
import {fetch} from "undici"

export class GiygasApiAdapter implements MedicamentApiGateway {
    async fetchDetailsByCis(cis: Cis): Promise<MedicamentResponse> {
        if (process.env.FUNCTIONS_EMULATOR === 'true') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        }
        const response = await fetch(`https://medicaments-api.giygas.dev/medicament/id/${cis.getValue()}`);
        if (!response.ok) throw new Error('EXTERNAL_API_ERROR')
        return await response.json() as MedicamentResponse
    }
}