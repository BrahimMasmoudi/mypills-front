import { GetMedicationDetails } from './get-medication-details'
import { CisLookupRepository } from '../../../../domain/gateway/cis-lookup-repository'
import { MedicamentApiGateway } from '../../../../domain/gateway/medicament-api-gateway'
import { Cip13 } from '../../../../types/cip13'
import { Cis } from '../../../../types/cis'
import { MedicamentResponse } from '../../../../types/medicationApi'
import { toMedicationDto } from '../../../../utils/mapper'

describe('GetMedicationDetails Use Case', () => {
    let mockCisLookup: jest.Mocked<CisLookupRepository>
    let mockApiGateway: jest.Mocked<MedicamentApiGateway>
    let useCase: GetMedicationDetails

    beforeEach(() => {
        // 1. Arrange Mocks
        mockCisLookup = {
            getCisByCip13: jest.fn(),
        }

        mockApiGateway = {
            fetchDetailsByCis: jest.fn(),
        }

        useCase = new GetMedicationDetails(mockCisLookup, mockApiGateway)
    })

    it('should return mapped medication details when CIP exists in DB and API', async () => {
        // Arrange
        const validCip = Cip13.create('3400934913154')
        const mockCis = Cis.create('61234567')

        // Mock API response with all fields required by the mapper
        const mockApiResponse: MedicamentResponse = {
            cis: 61234567,
            elementPharmaceutique: 'Doliprane 1000mg',
            formePharmaceutique: 'gélule',
            voiesAdministration: ['Orale'],
            statusAutorisation: 'Autorisée',
            typeProcedure: 'Nationale',
            etatComercialisation: 'Commercialisée',
            dateAMM: '1985-05-15',
            titulaire: 'SANOFI',
            surveillanceRenforcee: 'Non',
            composition: [],
            generiques: null,
            presentation: [],
            conditions: null,
        }

        mockCisLookup.getCisByCip13.mockResolvedValue(mockCis)
        mockApiGateway.fetchDetailsByCis.mockResolvedValue(mockApiResponse)

        // Act
        const result = await useCase.execute(validCip)

        // Assert
        expect(mockCisLookup.getCisByCip13).toHaveBeenCalledWith(validCip)
        expect(mockApiGateway.fetchDetailsByCis).toHaveBeenCalledWith(mockCis)

        // Check specific fields
        expect(result.name).toBe('Doliprane 1000mg')
        expect(result.cis).toBe('61234567')

        // Check if mapper worked
        expect(result.details.company).toBe('SANOFI')
        expect(result.details.enhancedSurveillance).toBe(false)
        expect(Array.isArray(result.details.ingredients)).toBe(true)
    })

    it('should throw an error if the CIP is not found in the database', async () => {
        // Arrange
        const validCip = Cip13.create('3400934913154')
        mockCisLookup.getCisByCip13.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute(validCip)).rejects.toThrow('NOT_FOUND_IN_DB')

        // Ensure API was never called because DB lookup failed
        expect(mockApiGateway.fetchDetailsByCis).not.toHaveBeenCalled()
    })

    it('should throw an error if the API gateway fails', async () => {
        // Arrange
        const validCip = Cip13.create('3400934913154')
        const mockCis = Cis.create('61234567')

        mockCisLookup.getCisByCip13.mockResolvedValue(mockCis)
        mockApiGateway.fetchDetailsByCis.mockRejectedValue(new Error('API_DOWN'))

        // Act & Assert
        await expect(useCase.execute(validCip)).rejects.toThrow('API_DOWN')
    })

    it('should sanitize missing optional fields, drifted non-arrays, and non-finite numbers in toMedicationDto', () => {
        const driftedResponse = {
            cis: 60234100,
            elementPharmaceutique: 'Doliprane 1000mg',
            voiesAdministration: 'Orale',
            composition: 'unexpected-string',
            presentation: [
                {
                    libelle: undefined,
                    cip13: Number.NaN,
                    prix: null,
                    tauxRemboursement: undefined,
                },
                {
                    libelle: 'Boîte de 16 comprimés',
                    cip13: '3400935955838',
                    prix: '1.15',
                    tauxRemboursement: '65%',
                },
            ],
        } as unknown as MedicamentResponse

        const dto = toMedicationDto(driftedResponse)

        expect(dto.form).toBe('')
        expect(dto.administrationRoutes).toEqual([])
        expect(dto.authStatus).toBe('')
        expect(dto.procedureType).toBe('')
        expect(dto.marketingStatus).toBe('')
        expect(dto.approvalDate).toBe('')
        expect(dto.company).toBe('')
        expect(dto.enhancedSurveillance).toBe(false)
        expect(dto.ingredients).toEqual([])
        expect(dto.quantity).toBe(1)
        expect(dto.presentations).toEqual([
            {
                label: '',
                barcode13: 0,
                refundRate: '',
                price: 0,
            },
            {
                label: 'Boîte de 16 comprimés',
                barcode13: 0,
                refundRate: '65%',
                price: 0,
            },
        ])
    })
})
