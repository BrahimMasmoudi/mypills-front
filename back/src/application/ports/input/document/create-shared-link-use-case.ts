import { SharedLinkResponse } from '../../../domain/entities/document/shared-link-response'

export interface CreateSharedLinkUseCase {
    execute(userId: string, storagePath: string): Promise<SharedLinkResponse>
}
