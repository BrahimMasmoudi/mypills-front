import { Cip13 } from '../../types/cip13'
import { Cis } from '../../types/cis'

export interface CisLookupRepository {
    getCisByCip13(cip13: Cip13): Promise<Cis | null>
}
