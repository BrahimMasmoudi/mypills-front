import { SharedLink } from './shared-link'

describe('SharedLink Entity', () => {
    describe('isExpired', () => {
        it('should return false for a link that has not expired', () => {
            const tokenId = 'test-token-123'
            const storagePath = 'users/user123/documents/test.pdf'
            const userId = 'user123'
            const createdAt = new Date()
            const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000) // 1 hour from now

            const sharedLink = new SharedLink(tokenId, storagePath, userId, expiresAt, createdAt)

            expect(sharedLink.isExpired()).toBe(false)
        })

        it('should return true for a link that has expired', () => {
            const tokenId = 'test-token-456'
            const storagePath = 'users/user456/documents/test.pdf'
            const userId = 'user456'
            const createdAt = new Date()
            const expiresAt = new Date(createdAt.getTime() - 1000) // 1 second ago

            const sharedLink = new SharedLink(tokenId, storagePath, userId, expiresAt, createdAt)

            expect(sharedLink.isExpired()).toBe(true)
        })

        it('should return true after 10 seconds for a 10-second expiry', async () => {
            const tokenId = 'test-token-789'
            const storagePath = 'users/user789/documents/test.pdf'
            const userId = 'user789'
            const createdAt = new Date()
            const expiresAt = new Date(createdAt.getTime() + 10 * 1000) // 10 seconds from now

            const sharedLink = new SharedLink(tokenId, storagePath, userId, expiresAt, createdAt)

            // Should not be expired initially
            expect(sharedLink.isExpired()).toBe(false)

            // Wait 11 seconds
            await new Promise((resolve) => setTimeout(resolve, 11000))

            // Should be expired now
            expect(sharedLink.isExpired()).toBe(true)
        }, 15000) // Set Jest timeout to 15 seconds for this test
    })
})
