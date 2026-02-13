export interface DocumentStoragePort {
    exists(storagePath: string): Promise<boolean>
    generateTemporaryUrl(storagePath: string): Promise<string>
}
