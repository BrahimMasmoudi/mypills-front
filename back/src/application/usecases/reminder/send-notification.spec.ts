import { SendReminderNotification, SendNotificationCommand } from './send-notification'
import { UserRepository } from '../../../domain/gateway/reminder/user-repository'
import { NotificationGateway } from '../../../domain/gateway/reminder/notification-gateway'

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
        }

        useCase = new SendReminderNotification(mockUserRepo, mockNotificationGateway)

        // Clear console spies
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should send a notification when a valid token is found', async () => {
        // Arrange
        const command: SendNotificationCommand = {
            userId: 'user-123',
            medName: 'Doliprane',
            quantity: '1',
        }
        mockUserRepo.getDeviceToken.mockResolvedValue('fcm-token-xyz')

        // Act
        await useCase.execute(command)

        // Assert
        expect(mockUserRepo.getDeviceToken).toHaveBeenCalledWith('user-123')
        expect(mockNotificationGateway.sendMedicationReminder).toHaveBeenCalledWith(
            'fcm-token-xyz',
            'Doliprane',
            '1'
        )
    })

    it('should log a warning and return early if no token is found', async () => {
        // Arrange
        const command: SendNotificationCommand = {
            userId: 'user-no-token',
            medName: 'Doliprane',
            quantity: '1',
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
        await expect(useCase.execute({ userId: 'u1', medName: 'm1', quantity: '1' }))
            .rejects
            .toThrow('FCM Error')
    })
})
