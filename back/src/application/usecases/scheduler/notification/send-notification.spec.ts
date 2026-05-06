import { SendReminderNotification, SendNotificationCommand } from './send-notification'
import { UserRepository } from '../../../../domain/repositories/reminder/user-repository'
import { NotificationGateway } from '../../../../domain/gateway/scheduler/notification-gateway'

describe('SendReminderNotification Use Case', () => {
    let mockUserRepo: jest.Mocked<UserRepository>
    let mockNotificationGateway: jest.Mocked<NotificationGateway>
    let useCase: SendReminderNotification

    beforeEach(() => {
        // 1. Arrange: Mock the ports
        mockUserRepo = {
            getDeviceToken: jest.fn(),
            saveFcmToken: jest.fn(),
        }

        mockNotificationGateway = {
            sendMedicationReminder: jest.fn().mockResolvedValue(undefined),
            sendLowStockNotification: jest.fn().mockResolvedValue(undefined),
        }

        useCase = new SendReminderNotification(mockUserRepo, mockNotificationGateway)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should send a notification when a valid token is found', async () => {
        // Arrange
        const command: SendNotificationCommand = {
            userId: 'user-123',
            medName: 'Doliprane',
            medicationId: 'med-123',
            quantity: '1',
            reminderId: 'reminder-123',
        }
        mockUserRepo.getDeviceToken.mockResolvedValue('fcm-token-xyz')

        // Act
        await useCase.execute(command)

        // Assert
        expect(mockUserRepo.getDeviceToken).toHaveBeenCalledWith('user-123')
        expect(mockNotificationGateway.sendMedicationReminder).toHaveBeenCalledWith(
            'fcm-token-xyz',
            'Doliprane',
            'med-123',
            '1',
            'reminder-123'
        )
    })

    it('should log a warning and return early if no token is found', async () => {
        // Arrange
        const command: SendNotificationCommand = {
            userId: 'user-no-token',
            medName: 'Doliprane',
            medicationId: 'med-123',
            quantity: '1',
            reminderId: 'reminder-123',
        }
        mockUserRepo.getDeviceToken.mockResolvedValue(null)
        const warnSpy = jest.spyOn(console, 'warn')

        // Act
        await useCase.execute(command)

        // Assert
        expect(mockNotificationGateway.sendMedicationReminder).not.toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No FCM token found'))
    })

    it('should propagate errors from the notification gateway', async () => {
        // Arrange
        mockUserRepo.getDeviceToken.mockResolvedValue('valid-token')
        mockNotificationGateway.sendMedicationReminder.mockRejectedValue(new Error('FCM Error'))

        // Act & Assert
        await expect(useCase.execute({ userId: 'u1', medName: 'm1', medicationId: 'med-1', quantity: '1', reminderId: 'r1' }))
            .rejects
            .toThrow('FCM Error')
    })
})
