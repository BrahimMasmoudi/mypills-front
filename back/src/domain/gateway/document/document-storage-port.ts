export interface DocumentStoragePort {
    generateSignedUrl(storagePath: string, expiresInMs: number): Promise<string>
    exists(storagePath: string): Promise<boolean>
}
