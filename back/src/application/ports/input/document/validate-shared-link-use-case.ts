import { SharedLinkValidationResult } from '../../../../domain/entities/document/shared-link-validation-result'

export interface ValidateSharedLinkUseCase {
    execute(tokenId: string): Promise<SharedLinkValidationResult>
}
