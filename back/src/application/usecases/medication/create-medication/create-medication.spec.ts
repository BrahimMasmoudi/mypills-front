import { CreateMedication } from './create-medication'
import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

describe('IncrementMedication Use Case', () => {
    const mockAuth: AuthData = {
        uid: 'user-123',
        token: {
            uid: 'user-123',
            email: 'test@example.com',
        },
    } as any

    it('should execute the repository create method with the provided medication', async () => {
        // 1. Arrange: Create a "Mock" Repository
        // We don't need Firestore here, just a fake object that follows the interface
        const mockRepo: jest.Mocked<MedicationRepository> = {
            create: jest.fn().mockResolvedValue(undefined),
            increment: jest.fn().mockResolvedValue(undefined),
            decrement: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            setExpiredStatus: jest.fn().mockResolvedValue(undefined),
            fetchTunisianMedications: jest.fn().mockResolvedValue(undefined),
        }

        const useCase = new CreateMedication(mockRepo)
        const medication: Medication = {
            medicationId: 'med-unique-123',
            uid: 'user-auth-001',
            bareCode: '3400934913154', // Example CIP13
            name: 'Doliprane 1000mg',
            expiryDate: new Date('2026-12-31T23:59:59Z'),
            expired: false,
            quantity: 10,
            image: 'https://firebasestorage.googleapis.com/.../doliprane.png',
            email: 'user@example.com',
            details: {
                form: 'gélule',
                administrationRoutes: ['orale'],
                authStatus: 'Autorisée',
                procedureType: 'Procédure nationale',
                marketingStatus: 'Commercialisée',
                approvalDate: '1985-05-15',
                company: 'SANOFI AVENTIS FRANCE',
                enhancedSurveillance: false,
                ingredients: [
                    {
                        substance: 'PARACÉTAMOL',
                        dosage: '1000 mg',
                        reference: 'chaque gélule',
                    },
                ],
                presentations: [
                    {
                        label: 'plaquette(s) PVC-Aluminium de 8 gélule(s)',
                        barcode13: 3400934913154,
                        refundRate: '65%',
                        price: 2.18,
                    },
                ],
            },
        }

        // 2. Act
        await useCase.execute(medication, mockAuth)

        // 3. Assert
        expect(mockRepo.create).toHaveBeenCalledWith(medication, mockAuth)
        expect(mockRepo.create).toHaveBeenCalledTimes(1)
    })
})
