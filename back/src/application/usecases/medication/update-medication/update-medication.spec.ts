import { UpdateMedication } from './update-medication'
import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

describe('UpdateMedication Use Case', () => {
    // 1. Setup the mock AuthData correctly
    const mockAuth: AuthData = {
        uid: 'user-123',
        token: {
            uid: 'user-123',
            email: 'test@example.com',
        } as any,
    }

    it('should execute the repository update method with the correct argument order', async () => {
        // 2. Arrange: Create a "Mock" Repository
        const mockRepo: jest.Mocked<MedicationRepository> = {
            create: jest.fn().mockResolvedValue(undefined),
            increment: jest.fn().mockResolvedValue(undefined),
            decrement: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            setExpiredStatus: jest.fn().mockResolvedValue(undefined),
            fetchTunisianMedications: jest.fn().mockResolvedValue(undefined),
        }

        const useCase = new UpdateMedication(mockRepo)

        const medication: Medication = {
            medicationId: 'med-unique-123',
            uid: 'user-auth-001',
            bareCode: '3400934913154',
            name: 'Doliprane 1000mg',
            expiryDate: new Date('2026-12-31T23:59:59Z'),
            expired: false,
            quantity: 10,
            image: 'https://example.com/doliprane.png',
            email: 'user@example.com',
            updatedAt: new Date(),
            createdAt: new Date(),
        }

        // 3. Act
        // Calling the use case with (medication, key, value, auth)
        await useCase.execute(medication, 'name', 'test', mockAuth)

        // 4. Assert
        // Based on your error log, the repository receives: (medication, auth, key, value)
        expect(mockRepo.update).toHaveBeenCalledWith(
            medication,
            mockAuth, // Auth is the 2nd argument
            'name', // Key is 3rd
            'test' // Value is 4th
        )
        expect(mockRepo.update).toHaveBeenCalledTimes(1)
    })
})
