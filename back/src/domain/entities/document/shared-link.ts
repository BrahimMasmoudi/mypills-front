export class SharedLink {
    constructor(
        public readonly tokenId: string,
        public readonly storagePath: string,
        public readonly userId: string,
        public readonly expiresAt: Date,
        public readonly createdAt: Date
    ) { }

    isExpired(): boolean {
        return new Date() > this.expiresAt
    }

    isOwnedBy(userId: string): boolean {
        return this.userId === userId
    }

    toJSON() {
        return {
            tokenId: this.tokenId,
            storagePath: this.storagePath,
            userId: this.userId,
            expiresAt: this.expiresAt.toISOString(),
            createdAt: this.createdAt.toISOString(),
        }
    }

    static fromJSON(data: any): SharedLink {
        return new SharedLink(
            data.tokenId,
            data.storagePath,
            data.userId,
            new Date(data.expiresAt),
            new Date(data.createdAt)
        )
    }
}
