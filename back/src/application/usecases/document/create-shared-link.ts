import { CreateSharedLinkUseCase } from '../../ports/input/document/create-shared-link-use-case'
import { DocumentStoragePort } from '../../../domain/gateway/document/document-storage-port'

export class CreateSharedLink implements CreateSharedLinkUseCase {
    constructor(private readonly documentStorage: DocumentStoragePort) { }

    async execute(userId: string, storagePath: string): Promise<{ url: string, expires: string }> {
        const expectedPrefix = `users/${userId}/`
        if (!storagePath.startsWith(expectedPrefix)) {
            throw new Error('Permission denied: You can only share your own documents.')
        }

        const exists = await this.documentStorage.exists(storagePath)
        if (!exists) {
            throw new Error('Document not found.')
        }

        const expiresMs = 60 * 60 * 1000
        const url = await this.documentStorage.generateSignedUrl(storagePath, expiresMs)

        return {
            url,
            expires: new Date(Date.now() + expiresMs).toISOString()
        }
    }
}
