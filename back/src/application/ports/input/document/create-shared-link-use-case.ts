export interface CreateSharedLinkUseCase {
    execute(userId: string, storagePath: string): Promise<{ url: string, expires: string }>
}
