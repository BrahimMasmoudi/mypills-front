import { GetMedicationAdvice } from './get-medication-advice'
import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { AdvisorGateway } from '../../../domain/gateway/advisor-gateway'
import { UsageGateway } from '../../../domain/gateway/usage-gateway'
import { AuthData } from 'firebase-functions/v2/tasks'
import { Medication } from '../../../domain/entities/medication'

describe('GetMedicationAdvice', () => {
    let mockMedicationRepository: jest.Mocked<MedicationRepository>
    let mockAdvisorGateway: jest.Mocked<AdvisorGateway>
    let mockUsageGateway: jest.Mocked<UsageGateway>
    let useCase: GetMedicationAdvice

    const fakeAuth = { uid: 'u123' } as AuthData

    beforeEach(() => {
        mockMedicationRepository = {
            list: jest.fn(),
            create: jest.fn(),
            increment: jest.fn(),
            decrement: jest.fn(),
            delete: jest.fn(),
            updateName: jest.fn(),
            update: jest.fn(),
            updateNumberOfBoxes: jest.fn(),
            setExpiredStatus: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<MedicationRepository>

        mockAdvisorGateway = {
            getAdvice: jest.fn(),
        } as unknown as jest.Mocked<AdvisorGateway>

        mockUsageGateway = {
            checkAndIncrementUsage: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<UsageGateway>

        useCase = new GetMedicationAdvice(mockMedicationRepository, mockAdvisorGateway, mockUsageGateway)
    })

    it('should check quota, retrieve medications and pass to the gateway', async () => {
        const mockCabinet = [{ medicationId: 'm1' } as Medication]
        mockMedicationRepository.list.mockResolvedValueOnce(mockCabinet)
        mockAdvisorGateway.getAdvice.mockResolvedValueOnce({
            explanation: 'AI advice',
            usableMedications: mockCabinet,
        })

        const result = await useCase.execute('headache', 'en', fakeAuth)

        expect(mockUsageGateway.checkAndIncrementUsage).toHaveBeenCalledWith('u123', 5)
        expect(mockMedicationRepository.list).toHaveBeenCalledWith(fakeAuth)
        expect(mockAdvisorGateway.getAdvice).toHaveBeenCalledWith('headache', mockCabinet, 'en')
        expect(result.explanation).toBe('AI advice')
    })

    it('should immediately return empty explanation if cabinet is empty', async () => {
        mockMedicationRepository.list.mockResolvedValueOnce([])

        const result = await useCase.execute('headache', 'en', fakeAuth)

        expect(mockMedicationRepository.list).toHaveBeenCalledWith(fakeAuth)
        expect(mockAdvisorGateway.getAdvice).not.toHaveBeenCalled()
        expect(result.usableMedications).toEqual([])
        expect(result.explanation).toContain('You don\'t have any medications')
    })
})
