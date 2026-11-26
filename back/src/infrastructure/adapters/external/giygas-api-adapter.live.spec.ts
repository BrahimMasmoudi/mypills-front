import { GiygasApiAdapter } from './giygas-api-adapter'
import { Cis } from '../../../types/cis'

const describeLive = process.env.RUN_LIVE_API_TESTS === 'true' ? describe : describe.skip

describeLive('GiygasApiAdapter Live Contract Test', () => {
    it('fetches expected contract shape for CIS 60234100 under standard TLS', async () => {
        const adapter = new GiygasApiAdapter()
        const response = await adapter.fetchDetailsByCis(Cis.create('60234100'))

        expect(response).toBeDefined()
        expect(response.cis).toBe(60234100)
        expect(typeof response.elementPharmaceutique).toBe('string')
        expect(response.elementPharmaceutique.trim().length).toBeGreaterThan(0)
        expect(Array.isArray(response.composition)).toBe(true)
        expect(Array.isArray(response.presentation)).toBe(true)
        expect(response.presentation.length).toBeGreaterThan(0)
        expect(typeof response.presentation[0].libelle).toBe('string')
        expect(typeof response.presentation[0].cip13).toBe('number')
    })
})
