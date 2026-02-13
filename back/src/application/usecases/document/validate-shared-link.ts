import { ValidateSharedLinkUseCase } from '../../ports/input/document/validate-shared-link-use-case'
import { SharedLinkRepositoryPort } from '../../../domain/gateway/document/shared-link-repository-port'
import { DocumentStoragePort } from '../../../domain/gateway/document/document-storage-port'

export class ValidateSharedLink implements ValidateSharedLinkUseCase {
    constructor(
        private readonly sharedLinkRepository: SharedLinkRepositoryPort,
        private readonly documentStorage: DocumentStoragePort
    ) { }

    async execute(tokenId: string): Promise<{ valid: boolean, url?: string, error?: string }> {
        // Find the shared link by token
        const sharedLink = await this.sharedLinkRepository.findByToken(tokenId)

        if (!sharedLink) {
            return { valid: false, error: 'Link not found' }
        }

        // Check if expired
        if (sharedLink.isExpired()) {
            return { valid: false, error: 'Link expired' }
        }

        // Generate Storage URL with download token
        // Note: The Storage URL itself doesn't expire - expiry is enforced by this validation endpoint
        const url = await this.documentStorage.generateTemporaryUrl(sharedLink.storagePath)

        return { valid: true, url }
    }
}
