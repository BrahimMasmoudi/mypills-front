import { UpdateRemindersStatus } from './update-reminders-status'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'
import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { UserRepository } from '../../../domain/repositories/user/user-repository'
import { NotificationGateway } from '../../../domain/gateway/scheduler/notification-gateway'

describe('UpdateRemindersStatus Use Case', () => {
    let mockRepo: jest.Mocked<ReminderRepository>
    let mockScheduler: jest.Mocked<TaskSchedulerPort>
    let mockMedicationRepo: jest.Mocked<MedicationRepository>
    let mockUserRepo: jest.Mocked<UserRepository>
    let mockNotificationGateway: jest.Mocked<NotificationGateway>
    let useCase: UpdateRemindersStatus

    beforeEach(() => {
        mockRepo = {
            nextId: jest.fn(),
            saveBatch: jest.fn(),
            getById: jest.fn().mockImplementation((id) => Promise.resolve({
                reminderId: id,
                scheduledTime: new Date('2026-02-10T10:00:00Z'),
                userId: 'u1',
                medName: 'm1',
                medicationId: 'med-1',
                quantity: 1,
                status: 'pending'
            })),
            updateRemindersStatus: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn(),
        } as any

        mockScheduler = {
            scheduleNotificationTask: jest.fn(),
            cancelNotificationTask: jest.fn().mockResolvedValue(undefined),
        }

        mockMedicationRepo = {
            get: jest.fn().mockResolvedValue({ name: 'm1', quantity: 10 } as any),
            decrement: jest.fn().mockResolvedValue(undefined),
        } as any

        mockUserRepo = {
            getDeviceToken: jest.fn().mockResolvedValue('token-123'),
        } as any

        mockNotificationGateway = {
            sendMedicationReminder: jest.fn(),
            sendLowStockNotification: jest.fn().mockResolvedValue(undefined),
        }

        useCase = new UpdateRemindersStatus(mockRepo, mockScheduler, mockMedicationRepo, mockUserRepo, mockNotificationGateway)
    })

    it('should call the repository updateRemindersStatus method with correct IDs and status', async () => {
        // Arrange
        const mockIds = ['rem-1', 'rem-2']
        const status = 'done'

        // Act
        await useCase.execute(mockIds, status)

        // Assert
        expect(mockRepo.updateRemindersStatus).toHaveBeenCalledWith(mockIds, status)
    })

    it('should cancel tasks when status is done', async () => {
        // Arrange
        const mockIds = ['rem-1', 'rem-2']

        // Act
        await useCase.execute(mockIds, 'done')

        // Assert
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledTimes(2)
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('rem-1', new Date('2026-02-10T10:00:00Z'))
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('rem-2', new Date('2026-02-10T10:00:00Z'))
    })

    it('should propagate errors if the repository update fails', async () => {
        // Arrange
        const mockIds = ['id-1']
        const status = 'failed'
        const errorMessage = 'Firestore write failed'
        mockRepo.updateRemindersStatus.mockRejectedValue(new Error(errorMessage))

        // Act & Assert
        await expect(useCase.execute(mockIds, status)).rejects.toThrow(errorMessage)
    })

    it('should handle different statuses correctly', async () => {
        // Arrange
        const mockIds = ['id-999']
        const status = 'failed'

        // Act
        await useCase.execute(mockIds, status)

        // Assert
        expect(mockRepo.updateRemindersStatus).toHaveBeenCalledWith(mockIds, 'failed')
    })

    it('should decrement inventory when status is done', async () => {
        // Arrange
        const mockIds = ['rem-1']

        // Act
        await useCase.execute(mockIds, 'done')

        // Assert
        expect(mockMedicationRepo.decrement).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'm1' }),
            expect.any(Object),
            1
        )
    })

    it('should send low stock notification when quantity <= 3 and not in app', async () => {
        // Arrange
        const mockIds = ['rem-1']
        mockMedicationRepo.get
            .mockResolvedValueOnce({ name: 'm1', quantity: 4 } as any) // initial
            .mockResolvedValueOnce({ name: 'm1', quantity: 3 } as any) // updated

        // Act
        await useCase.execute(mockIds, 'done', false)

        // Assert
        expect(mockNotificationGateway.sendLowStockNotification).toHaveBeenCalledWith('token-123', 'm1', 3)
    })

    it('should NOT send low stock notification when in app', async () => {
        // Arrange
        const mockIds = ['rem-1']
        mockMedicationRepo.get
            .mockResolvedValueOnce({ name: 'm1', quantity: 4 } as any) // initial
            .mockResolvedValueOnce({ name: 'm1', quantity: 3 } as any) // updated

        // Act
        const result = await useCase.execute(mockIds, 'done', true)

        // Assert
        expect(mockNotificationGateway.sendLowStockNotification).not.toHaveBeenCalled()
        expect(result).toContainEqual({ medicationName: 'm1', remainingQuantity: 3 })
    })
})
