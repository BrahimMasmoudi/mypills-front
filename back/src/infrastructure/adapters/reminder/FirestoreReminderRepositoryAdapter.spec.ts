import { Timestamp } from 'firebase-admin/firestore'
import { Reminder } from '../../../domain/entities/reminder'
import { FirestoreReminderRepositoryAdapter } from './FirestoreReminderRepositoryAdapter'

describe('FirestoreReminderRepositoryAdapter', () => {
    let mockConnector: any
    let mockCollection: any
    let mockBatch: any
    let mockDoc: any
    let mockScheduler: any
    let adapter: FirestoreReminderRepositoryAdapter

    beforeEach(() => {
        // 1. Setup nested Firestore mocks
        mockDoc = {
            id: 'generated-id-123',
            set: jest.fn(),
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined), // Added mock for delete
        }

        mockBatch = {
            set: jest.fn().mockReturnThis(),
            commit: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
        }

        mockCollection = {
            doc: jest.fn().mockReturnValue(mockDoc),
        }

        mockConnector = {
            collection: jest.fn().mockReturnValue(mockCollection),
            firestore: {
                batch: jest.fn().mockReturnValue(mockBatch),
            },
        }

        mockScheduler = {
            scheduleNotificationTask: jest.fn().mockResolvedValue('task-id'),
            cancelNotificationTask: jest.fn().mockResolvedValue(undefined),
        }

        adapter = new FirestoreReminderRepositoryAdapter(mockConnector, mockScheduler)
    })

    describe('nextId', () => {
        it('should return a generated string id from firestore doc', () => {
            const id = adapter.nextId()
            expect(mockCollection.doc).toHaveBeenCalled()
            expect(id).toBe('generated-id-123')
        })
    })

    describe('saveBatch', () => {
        it('should execute a batch set for each reminder provided', async () => {
            // Arrange
            const reminders: Reminder[] = [
                {
                    reminderId: 'id-1',
                    sicknessName: 'sickness',
                    userId: 'u1',
                    medName: 'Doli',
                    quantity: 1,
                    scheduledTime: new Date(),
                    status: 'pending',
                },
            ]

            // Act
            await adapter.saveBatch(reminders)

            // Assert
            expect(mockConnector.firestore.batch).toHaveBeenCalled()
            expect(mockCollection.doc).toHaveBeenCalledWith('id-1')
            expect(mockBatch.set).toHaveBeenCalledWith(
                mockDoc,
                expect.objectContaining({
                    medName: 'Doli',
                    scheduledTime: expect.any(Timestamp),
                    createdAt: expect.any(Timestamp),
                })
            )
            expect(mockBatch.commit).toHaveBeenCalled()
        })

        it('should return early if array is empty', async () => {
            await adapter.saveBatch([])
            expect(mockConnector.firestore.batch).not.toHaveBeenCalled()
        })
    })

    describe('getById', () => {
        it('should return a mapped Reminder if document exists', async () => {
            // Arrange
            const mockDate = new Date()
            mockDoc.get.mockResolvedValue({
                exists: true,
                id: 'id-1',
                data: () => ({
                    sicknessName: 'sickness',
                    userId: 'u1',
                    medName: 'Doli',
                    quantity: 1,
                    scheduledTime: Timestamp.fromDate(mockDate),
                    status: 'pending',
                }),
            })

            // Act
            const result = await adapter.getById('id-1')

            // Assert
            expect(result).toEqual({
                sicknessName: 'sickness',
                reminderId: 'id-1',
                userId: 'u1',
                medName: 'Doli',
                quantity: 1,
                scheduledTime: mockDate,
                status: 'pending',
            })
        })

        it('should return null if document does not exist', async () => {
            mockDoc.get.mockResolvedValue({ exists: false })
            const result = await adapter.getById('non-existent')
            expect(result).toBeNull()
        })
    })

    describe('updateRemindersStatus', () => {
        it('should update the status and updatedAt field via batch for all provided IDs', async () => {
            // Arrange
            const ids = ['id-1', 'id-2']
            const status = 'done'

            // Act
            await adapter.updateRemindersStatus(ids, status)

            // Assert
            // 1. Verify batch was created
            expect(mockConnector.firestore.batch).toHaveBeenCalled()

            // 2. Verify doc was called for each ID to get references
            expect(mockCollection.doc).toHaveBeenCalledWith('id-1')
            expect(mockCollection.doc).toHaveBeenCalledWith('id-2')

            // 3. Verify batch.update was called with correct data
            // In your mock setup, mockCollection.doc returns mockDoc
            expect(mockBatch.update).toHaveBeenCalledTimes(2)
            expect(mockBatch.update).toHaveBeenCalledWith(mockDoc, {
                status: 'done',
                updatedAt: expect.any(Timestamp),
            })

            // 4. Verify the batch was committed
            expect(mockBatch.commit).toHaveBeenCalled()
        })

        it('should return early and not create a batch if IDs array is empty', async () => {
            await adapter.updateRemindersStatus([], 'done')
            expect(mockConnector.firestore.batch).not.toHaveBeenCalled()
        })
    })

    describe('delete', () => {
        it('should execute a batch delete for all provided IDs', async () => {
            // Arrange
            const idsToDelete = ['id-1', 'id-2']
            const mockScheduledTime = new Date('2026-02-10T10:00:00Z')

            // Mock doc.get() to return reminder data with scheduledTime
            mockDoc.get = jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({
                    scheduledTime: { toDate: () => mockScheduledTime },
                    userId: 'user-1',
                    medName: 'Med',
                    quantity: 1,
                    status: 'pending'
                })
            })

            // Act
            await adapter.delete(idsToDelete)

            // Assert
            // 1. Verify scheduler.cancelNotificationTask was called for each ID with scheduledTime
            expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('id-1', mockScheduledTime)
            expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('id-2', mockScheduledTime)

            // 2. Verify batch was created
            expect(mockConnector.firestore.batch).toHaveBeenCalled()

            // 3. Verify collection.doc was called for each ID
            expect(mockCollection.doc).toHaveBeenCalledWith('id-1')
            expect(mockCollection.doc).toHaveBeenCalledWith('id-2')

            // 4. Verify batch.delete was called with the docRefs
            expect(mockBatch.delete).toHaveBeenCalledTimes(2)
            expect(mockBatch.delete).toHaveBeenCalledWith(mockDoc)

            // 5. Verify batch was committed
            expect(mockBatch.commit).toHaveBeenCalled()
        })

        it('should return early if the array of IDs is empty', async () => {
            // Act
            await adapter.delete([])

            // Assert
            expect(mockConnector.firestore.batch).not.toHaveBeenCalled()
        })
    })

    describe('updateReminderTime', () => {
        it('should update the scheduledTime and updatedAt field', async () => {
            // Arrange
            const id = 'id-1'
            const newTime = new Date()

            // Act
            await adapter.updateReminderTime(id, newTime)

            // Assert
            expect(mockCollection.doc).toHaveBeenCalledWith(id)
            expect(mockDoc.update).toHaveBeenCalledWith({
                scheduledTime: Timestamp.fromDate(newTime),
                updatedAt: expect.any(Timestamp),
            })
        })
    })
})
