import {MedicamentApiGateway} from "../../../domain/gateway/medicament-api-gateway";
import {MedicamentResponse} from "../../../types/medicationApi";
import {Cis} from "../../../types/cis";

export class GiygasApiAdapter implements MedicamentApiGateway {
    async fetchDetailsByCis(cis: Cis): Promise<MedicamentResponse> {
        if (process.env.FUNCTIONS_EMULATOR === 'true') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        }
        try{
            const response = await fetch(`https://medicaments-api.giygas.dev/medicament/id/${cis.getValue()}`);
            console.log(response)
            if (!response.ok) throw new Error('EXTERNAL_API_ERROR')
            return await response.json()
        } catch (e) {
            console.log(e)
            throw e;
        }

    }
}