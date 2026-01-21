export interface UserRepository {
    saveFcmToken(userId: string, token: string): Promise<void>
    getDeviceToken(userId: string): Promise<string | null>
}
