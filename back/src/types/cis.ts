export class Cis {
    private constructor(private readonly value: string) {
    }

    public static create(value: string): Cis {
        if (!this.isValid(value)) throw new Error(`Invalid CIS code: ${value}`)
        return new Cis(value)
    }

    public static isValid(value: string): boolean {
        return /^\d{8}$/.test(value)
    }

    public getValue(): string {
        return this.value
    }
}
