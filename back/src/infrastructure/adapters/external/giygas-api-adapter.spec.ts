import { Dispatcher, MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'
import { logger } from 'firebase-functions/v2'
import { GiygasApiAdapter } from './giygas-api-adapter'
import { ExternalApiError } from './external-api-error'
import { Cis } from '../../../types/cis'

const ORIGIN = 'https://medicaments-api.giygas.dev'
const TEST_CIS = Cis.create('60234100')

describe('GiygasApiAdapter (mocked)', () => {
    let originalDispatcher: Dispatcher
    let mockAgent: MockAgent
    let adapter: GiygasApiAdapter

    beforeAll(() => {
        originalDispatcher = getGlobalDispatcher()
        mockAgent = new MockAgent()
        mockAgent.disableNetConnect()
        setGlobalDispatcher(mockAgent)
    })

    beforeEach(() => {
        adapter = new GiygasApiAdapter(50)
        jest.restoreAllMocks()
    })

    afterAll(async () => {
        setGlobalDispatcher(originalDispatcher)
        await mockAgent.close()
    })

    it('returns parsed response when payload is valid and tolerates extra unknown fields', async () => {
        const payload = {
            cis: 60234100,
            elementPharmaceutique: 'DOLIPRANE 1000 mg, comprimé',
            formePharmaceutique: 'comprimé',
            voiesAdministration: ['orale'],
            statusAutorisation: 'Autorisation active',
            typeProcedure: 'Procédure nationale',
            etatComercialisation: 'Commercialisée',
            dateAMM: '09/07/2002',
            titulaire: 'OPELLA HEALTHCARE FRANCE',
            surveillanceRenforcee: 'Non',
            composition: [],
            generiques: null,
            presentation: [],
            conditions: null,
            unexpectedExtraField: 'ignored-by-adapter',
        }

        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(200, payload, { headers: { 'content-type': 'application/json' } })

        const result = await adapter.fetchDetailsByCis(TEST_CIS)

        expect(result.elementPharmaceutique).toBe('DOLIPRANE 1000 mg, comprimé')
        expect(result.titulaire).toBe('OPELLA HEALTHCARE FRANCE')
    })

    it('succeeds with warning log when secondary collection fields drift from arrays', async () => {
        const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => undefined)
        const payload = {
            cis: 60234100,
            elementPharmaceutique: 'DOLIPRANE 1000 mg, comprimé',
            composition: 'unexpected-string',
            presentation: { broken: true },
        }

        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(200, payload, { headers: { 'content-type': 'application/json' } })

        const result = await adapter.fetchDetailsByCis(TEST_CIS)

        expect(result.elementPharmaceutique).toBe('DOLIPRANE 1000 mg, comprimé')
        expect(warnSpy).toHaveBeenCalledWith(
            'External medication API secondary field schema drift detected',
            expect.objectContaining({
                cis: '60234100',
                driftedFields: ['composition', 'presentation'],
            })
        )
    })

    it('throws ExternalApiError SCHEMA_ERROR when elementPharmaceutique is missing or empty', async () => {
        jest.spyOn(logger, 'error').mockImplementation(() => undefined)
        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(200, { cis: 60234100, elementPharmaceutique: '   ' }, { headers: { 'content-type': 'application/json' } })

        await expect(adapter.fetchDetailsByCis(TEST_CIS)).rejects.toMatchObject({
            name: 'ExternalApiError',
            errorKind: 'SCHEMA_ERROR',
        })
    })

    it('throws ExternalApiError SCHEMA_ERROR when body is invalid JSON', async () => {
        jest.spyOn(logger, 'error').mockImplementation(() => undefined)
        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(200, 'not-json{{{', { headers: { 'content-type': 'application/json' } })

        await expect(adapter.fetchDetailsByCis(TEST_CIS)).rejects.toMatchObject({
            name: 'ExternalApiError',
            errorKind: 'SCHEMA_ERROR',
        })
    })

    it('throws NOT_FOUND_IN_DB on HTTP 404', async () => {
        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(404, { error: 'Not Found' }, { headers: { 'content-type': 'application/json' } })

        await expect(adapter.fetchDetailsByCis(TEST_CIS)).rejects.toThrow('NOT_FOUND_IN_DB')
    })

    it('throws ExternalApiError HTTP_ERROR on HTTP 500', async () => {
        jest.spyOn(logger, 'error').mockImplementation(() => undefined)
        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(500, { error: 'Internal Server Error' }, { headers: { 'content-type': 'application/json' } })

        const promise = adapter.fetchDetailsByCis(TEST_CIS)
        await expect(promise).rejects.toBeInstanceOf(ExternalApiError)
        await expect(promise).rejects.toMatchObject({
            errorKind: 'HTTP_ERROR',
            meta: expect.objectContaining({ httpStatus: 500, cis: '60234100' }),
        })
    })

    it('throws ExternalApiError NETWORK_ERROR on transport failure', async () => {
        jest.spyOn(logger, 'error').mockImplementation(() => undefined)
        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .replyWithError(new Error('ECONNRESET'))

        await expect(adapter.fetchDetailsByCis(TEST_CIS)).rejects.toMatchObject({
            name: 'ExternalApiError',
            errorKind: 'NETWORK_ERROR',
        })
    })

    it('throws ExternalApiError TIMEOUT when request exceeds configured timeoutMs', async () => {
        jest.spyOn(logger, 'error').mockImplementation(() => undefined)
        mockAgent
            .get(ORIGIN)
            .intercept({ path: '/medicament/id/60234100', method: 'GET' })
            .reply(200, { elementPharmaceutique: 'Too late' }, { headers: { 'content-type': 'application/json' } })
            .delay(150)

        await expect(adapter.fetchDetailsByCis(TEST_CIS)).rejects.toMatchObject({
            name: 'ExternalApiError',
            errorKind: 'TIMEOUT',
        })
    })
})
