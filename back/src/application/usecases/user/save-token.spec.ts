import { SaveUserToken } from './save-token'
import { UserRepository } from '../../../domain/repositories/user/user-repository'

describe('SaveUserToken Use Case', () => {
    let mockUserRepo: jest.Mocked<UserRepository>
    let useCase: SaveUserToken

    beforeEach(() => {
        // 1. Arrange: Create a mock of the UserRepository
        mockUserRepo = {
            saveFcmToken: jest.fn().mockResolvedValue(undefined),
            getDeviceToken: jest.fn(),
            saveUser: jest.fn().mockResolvedValue(undefined),
        }

        useCase = new SaveUserToken(mockUserRepo)
    })

    it('should successfully save the token when userId and token are valid', async () => {
        // Arrange
        const userId = 'user-123'
        const token = 'fcm-token-xyz'

        // Act
        await useCase.execute(userId, token)

        // Assert
        expect(mockUserRepo.saveFcmToken).toHaveBeenCalledWith(userId, token)
        expect(mockUserRepo.saveFcmToken).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if the token is missing', async () => {
        // Act & Assert
        await expect(useCase.execute('user-123', ''))
            .rejects
            .toThrow('Invalid userId or token')

        expect(mockUserRepo.saveFcmToken).not.toHaveBeenCalled()
    })

    it('should throw an error if the userId is missing', async () => {
        // Act & Assert
        await expect(useCase.execute('', 'token-xyz'))
            .rejects
            .toThrow('Invalid userId or token')

        expect(mockUserRepo.saveFcmToken).not.toHaveBeenCalled()
    })

    it('should propagate errors from the repository', async () => {
        // Arrange
        mockUserRepo.saveFcmToken.mockRejectedValue(new Error('Database error'))

        // Act & Assert
        await expect(useCase.execute('user-123', 'token-xyz'))
            .rejects
            .toThrow('Database error')
    })
})
