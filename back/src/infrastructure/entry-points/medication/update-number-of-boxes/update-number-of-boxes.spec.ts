import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { Medication } from '../../../../domain/entities/medication'

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

describe('onMedicationUpdate Trigger', () => {
    let internalFunction: any

    beforeAll(() => {
        internalFunction = testEnv.wrap(functions.onMedicationUpdate)
    })

    afterAll(() => {
        testEnv.cleanup()
    })

    it('should update numberOfBoxes when quantity changes', async () => {
        // Arrange
        const beforeData: Partial<Medication> = {
            quantity: 10,
            unitsPerBox: 10,
            numberOfBoxes: 1,
            medicationId: 'med-1',
        }
        const afterData: Partial<Medication> = {
            ...beforeData,
            quantity: 11, // Changed
        }

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot(beforeData, 'medications/med-1')
        const afterSnap = testEnv.firestore.makeDocumentSnapshot(afterData, 'medications/med-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)

        const updateStub = jest.fn().mockResolvedValue({})
        Object.assign(afterSnap.ref, { update: updateStub })

        // Act
        await internalFunction({
            data: change,
            params: { medicationId: 'med-1' },
        })

        // Assert
        // 11 / 10 = 1.1 -> ceil -> 2
        expect(updateStub).toHaveBeenCalledWith({
            numberOfBoxes: 2,
            updatedAt: expect.any(Date),
        })
    })

    it('should update numberOfBoxes when unitsPerBox changes', async () => {
        // Arrange
        const beforeData: Partial<Medication> = {
            quantity: 10,
            unitsPerBox: 10,
            numberOfBoxes: 1,
            medicationId: 'med-1',
        }
        const afterData: Partial<Medication> = {
            ...beforeData,
            unitsPerBox: 5, // Changed
        }

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot(beforeData, 'medications/med-1')
        const afterSnap = testEnv.firestore.makeDocumentSnapshot(afterData, 'medications/med-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)

        const updateStub = jest.fn().mockResolvedValue({})
        Object.assign(afterSnap.ref, { update: updateStub })

        // Act
        await internalFunction({
            data: change,
            params: { medicationId: 'med-1' },
        })

        // Assert
        // 10 / 5 = 2
        expect(updateStub).toHaveBeenCalledWith({
            numberOfBoxes: 2,
            updatedAt: expect.any(Date),
        })
    })

    it('should NOT update if quantity and unitsPerBox match numberOfBoxes (idempotency)', async () => {
        // Arrange
        const beforeData: Partial<Medication> = {
            quantity: 10,
            unitsPerBox: 10,
            numberOfBoxes: 1,
            medicationId: 'med-1',
        }
        // Even if triggered (e.g. name changed), if boxes are correct, don't update
        const afterData: Partial<Medication> = {
            ...beforeData,
            name: 'New Name',
        }

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot(beforeData, 'medications/med-1')
        const afterSnap = testEnv.firestore.makeDocumentSnapshot(afterData, 'medications/med-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)
        const updateStub = jest.fn().mockResolvedValue({})
        Object.assign(afterSnap.ref, { update: updateStub })

        // Act
        await internalFunction({
            data: change,
            params: { medicationId: 'med-1' },
        })

        // Assert
        expect(updateStub).not.toHaveBeenCalled()
    })

    it('should NOT update if unitsPerBox is missing or zero', async () => {
        // Arrange
        const beforeData: Partial<Medication> = {
            quantity: 10,
            unitsPerBox: null as any,
            numberOfBoxes: 1,
            medicationId: 'med-1',
        }
        const afterData: Partial<Medication> = {
            ...beforeData,
            quantity: 15,
        }

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot(beforeData, 'medications/med-1')
        const afterSnap = testEnv.firestore.makeDocumentSnapshot(afterData, 'medications/med-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)
        const updateStub = jest.fn().mockResolvedValue({})
        Object.assign(afterSnap.ref, { update: updateStub })

        // Act
        await internalFunction({
            data: change,
            params: { medicationId: 'med-1' },
        })

        // Assert
        expect(updateStub).not.toHaveBeenCalled()
    })

    it('should handle document deletion (after is undefined)', async () => {
        // Arrange
        const beforeData: Partial<Medication> = {
            quantity: 10,
            medicationId: 'med-1',
        }

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot(beforeData, 'medications/med-1')
        // Deleted document
        const afterSnap = testEnv.firestore.makeDocumentSnapshot(null as any, 'medications/med-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)

        // Act
        await internalFunction({
            data: change,
            params: { medicationId: 'med-1' },
        })

        // Assert - no error, simply returns
    })
})
