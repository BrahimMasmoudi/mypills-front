import { FetchTunisianMedication } from './fetch-tunisian-medication'
import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { GetMedicationDetailsResponse } from '../../../../types/medicationApi'

describe('FetchTunisianMedication Use Case', () => {
    it('should call the repository fetch method and return the list of medications', async () => {
        const mockMeds: (GetMedicationDetailsResponse & { id: string })[] = [
            {
                id: 'tun-001',
                name: 'Doliprane 500mg',
                cis: '123456',
                details: {
                    form: 'comprimé',
                    company: 'SANOFI',
                } as any,
            },
        ]

        const mockRepo: jest.Mocked<MedicationRepository> = {
            fetchTunisianMedications: jest.fn().mockResolvedValue(mockMeds),
            create: jest.fn(),
            increment: jest.fn(),
            decrement: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            setExpiredStatus: jest.fn(),
            get: jest.fn(),
        }

        const useCase = new FetchTunisianMedication(mockRepo)
        const searchQuery = 'Doli'

        // 2. Act
        const result = await useCase.execute(searchQuery)

        // 3. Assert
        expect(mockRepo.fetchTunisianMedications).toHaveBeenCalledWith(searchQuery)
        expect(mockRepo.fetchTunisianMedications).toHaveBeenCalledTimes(1)

        // Verify the result matches what the repo returned
        expect(result).toEqual(mockMeds)
        expect(result[0].id).toBe('tun-001')
    })

    it('should propagate errors from the repository', async () => {
        // Arrange
        const mockRepo: jest.Mocked<MedicationRepository> = {
            fetchTunisianMedications: jest.fn().mockRejectedValue(new Error('Repo Error')),
        } as any

        const useCase = new FetchTunisianMedication(mockRepo)

        // Act & Assert
        await expect(useCase.execute('query')).rejects.toThrow('Repo Error')
    })
})
