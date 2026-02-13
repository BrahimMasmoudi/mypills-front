import { SharedLink } from '../../entities/document/shared-link'

export interface SharedLinkRepositoryPort {
    save(sharedLink: SharedLink): Promise<void>
    findByToken(tokenId: string): Promise<SharedLink | null>
}
