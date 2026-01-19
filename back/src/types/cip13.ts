export class Cip13 {
    private constructor(private readonly value: string) {
    }
    public static create(value: string): Cip13 {
        return new Cip13(value)
    }

    public getValue(): string {
        return this.value
    }
}