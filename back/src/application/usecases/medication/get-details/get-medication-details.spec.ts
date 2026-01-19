import {GetMedicationDetails} from './get-medication-details'
import {CisLookupRepository} from '../../../../domain/gateway/cis-lookup-repository'
import {MedicamentApiGateway} from '../../../../domain/gateway/medicament-api-gateway'
import {Cip13} from '../../../../types/cip13'

describe('GetMedicationDetails Use Case', () => {
    let mockCisLookup: jest.Mocked<CisLookupRepository>
    let mockApiGateway: jest.Mocked<MedicamentApiGateway>
    let useCase: GetMedicationDetails

    beforeEach(() => {
        // 1. Arrange Mocks
        mockCisLookup = {
            getCisByCip13: jest.fn()
        }

        mockApiGateway = {
            fetchDetailsByCis: jest.fn()
        }

        useCase = new GetMedicationDetails(mockCisLookup, mockApiGateway)
    })

    it('should return mapped medication details when CIP exists in DB and API', async () => {
        // Arrange
        const validCip = Cip13.create('3400934913154');
        const mockCis = { getValue: () => '61234567' };

        // Mock API response with all fields required by the mapper
        const mockApiResponse = {
            elementPharmaceutique: 'Doliprane 1000mg',
            denomination: 'DOLIPRANE 1000 mg, gélule',
            formePharmaceutique: 'gélule',
            voiesAdministration: ['Orale'],
            statusAutorisation: 'Autorisée',
            typeProcedure: 'Nationale',
            etatComercialisation: 'Commercialisée',
            dateAMM: '1985-05-15',
            titulaire: 'SANOFI',
            surveillanceRenforce: 'Non', // mapper calls .toLowerCase() on this
            composition: [],            // mapper iterates over this
            presentation: []            // mapper iterates over this
        };

        mockCisLookup.getCisByCip13.mockResolvedValue(mockCis as any);
        mockApiGateway.fetchDetailsByCis.mockResolvedValue(mockApiResponse as any);

        // Act
        const result = await useCase.execute(validCip);

        // Assert
        expect(mockCisLookup.getCisByCip13).toHaveBeenCalledWith(validCip);
        expect(mockApiGateway.fetchDetailsByCis).toHaveBeenCalledWith(mockCis);

        // Check specific fields
        expect(result.name).toBe('Doliprane 1000mg');
        expect(result.cis).toBe('61234567');

        // Check if mapper worked
        expect(result.details.company).toBe('SANOFI');
        expect(result.details.enhancedSurveillance).toBe(false);
        expect(Array.isArray(result.details.ingredients)).toBe(true);
    });

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
        const mockCis = {getValue: () => '61234567'}

        mockCisLookup.getCisByCip13.mockResolvedValue(mockCis as any)
        mockApiGateway.fetchDetailsByCis.mockRejectedValue(new Error('API_DOWN'))

        // Act & Assert
        await expect(useCase.execute(validCip)).rejects.toThrow('API_DOWN')
    })
})