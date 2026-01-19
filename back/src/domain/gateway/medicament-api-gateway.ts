import { MedicamentResponse } from '../../types/medicationApi'
import { Cis } from '../../types/cis'

export interface MedicamentApiGateway {
    fetchDetailsByCis(cis: Cis): Promise<MedicamentResponse>
}
