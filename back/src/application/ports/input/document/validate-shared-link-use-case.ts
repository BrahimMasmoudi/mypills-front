export interface ValidateSharedLinkUseCase {
    execute(tokenId: string): Promise<{ valid: boolean, url?: string, error?: string }>
}
