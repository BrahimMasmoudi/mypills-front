import { UserRepository } from '../../../domain/repositories/user/user-repository';

export class SaveUser {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(userId: string, name: string, email: string): Promise<void> {
        await this.userRepository.saveUser(userId, name, email);
    }
}
