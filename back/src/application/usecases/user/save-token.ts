import { UserRepository } from '../../../domain/repositories/user/user-repository'

export class SaveUserToken {
    constructor(private userRepo: UserRepository) {}

    async execute(userId: string, token: string): Promise<void> {
        if (!token || !userId) {
            throw new Error('Invalid userId or token')
        }
        await this.userRepo.saveFcmToken(userId, token)
    }
}
