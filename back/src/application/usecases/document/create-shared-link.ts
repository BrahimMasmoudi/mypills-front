import { CreateSharedLinkUseCase } from '../../ports/input/document/create-shared-link-use-case'
import { DocumentStoragePort } from '../../../domain/gateway/document/document-storage-port'
import { SharedLinkRepositoryPort } from '../../../domain/gateway/document/shared-link-repository-port'
import { SharedLink } from '../../../domain/entities/document/shared-link'
import { SharedLinkResponse } from '../../../domain/entities/document/shared-link-response'
import { randomUUID } from 'crypto'

export class CreateSharedLink implements CreateSharedLinkUseCase {
    constructor(
        private readonly documentStorage: DocumentStoragePort,
        private readonly sharedLinkRepository: SharedLinkRepositoryPort
    ) { }

    async execute(userId: string, storagePath: string): Promise<SharedLinkResponse> {
        const expectedPrefix = `users/${userId}/`
        if (!storagePath.startsWith(expectedPrefix)) {
            throw new Error('Permission denied: You can only share your own documents.')
        }

        const exists = await this.documentStorage.exists(storagePath)
        if (!exists) {
            throw new Error('Document not found.')
        }

        // Generate unique token ID
        const tokenId = randomUUID()
        const expiresMs = 60 * 60 * 1000 // 1 hour
        const now = new Date()
        const expiresAt = new Date(now.getTime() + expiresMs)

        // Create and save shared link entity
        const sharedLink = new SharedLink(
            tokenId,
            storagePath,
            userId,
            expiresAt,
            now
        )

        await this.sharedLinkRepository.save(sharedLink)

        // Determine base URL based on environment
        let baseUrl: string
        const isEmulator = process.env.FUNCTIONS_EMULATOR || process.env.FIRESTORE_EMULATOR_HOST

        if (isEmulator) {
            // Local emulator - use Functions emulator URL
            // Default Functions emulator runs on port 5001
            const projectId = process.env.GCLOUD_PROJECT || 'demo-project'
            const region = 'europe-west3'
            baseUrl = `http://127.0.0.1:5001/${projectId}/${region}`
        } else {
            // Production/Staging
            baseUrl = process.env.FUNCTIONS_URL || 'https://europe-west3-my-pills-staging-460b5.cloudfunctions.net'
        }

        const url = `${baseUrl}/validateSharedLink?token=${tokenId}`

        return {
            url,
            expires: expiresAt.toISOString()
        }
    }
}
