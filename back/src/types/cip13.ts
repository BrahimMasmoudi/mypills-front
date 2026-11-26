export class Cip13 {
    private constructor(private readonly value: string) {
    }

    public static create(value: string): Cip13 {
        if (!Cip13.isValid(value)) {
            throw new Error('Invalid CIP13 code')
        }
        return new Cip13(value)
    }

    public static isValid(value: unknown): value is string {
        return typeof value === 'string' && /^\d{12,13}$/.test(value)
    }

    public getValue(): string {
        return this.value
    }
}
