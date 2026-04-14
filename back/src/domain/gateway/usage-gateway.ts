export interface UsageGateway {
    checkAndIncrementUsage(uid: string, limit: number): Promise<void>
}
