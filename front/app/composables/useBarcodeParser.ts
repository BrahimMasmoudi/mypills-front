export const useBarcodeParser = () => {
    const parseBarcode = (code: string) => {
        let cip13: string | null
        let expiryDate: Date | null = null

        const cleanedCode = code
            .split('')
            .filter((char) => {
                const code = char.codePointAt(0) ?? 0
                return code > 31 && code !== 127
            })
            .join('')
            .trim()
        if (cleanedCode.startsWith('01') && cleanedCode.length >= 16) {
            const gtin = cleanedCode.substring(2, 16)

            if (gtin.length === 14 && gtin.startsWith('0')) {
                cip13 = gtin.substring(1)
            } else {
                cip13 = gtin
            }
            const remainder = cleanedCode.substring(16)
            if (remainder.startsWith('17') && remainder.length >= 8) {
                const rawDate = remainder.substring(2, 8)
                const yy = Number.parseInt(rawDate.substring(0, 2), 10)
                const mm = Number.parseInt(rawDate.substring(2, 4), 10)
                const dd = Number.parseInt(rawDate.substring(4, 6), 10)

                const fullYear = 2000 + yy
                expiryDate = new Date(fullYear, mm - 1, dd)
            }
        } else {
            if (cleanedCode.length === 13 && cleanedCode.startsWith('0')) {
                cip13 = cleanedCode.substring(1)
            } else {
                cip13 = cleanedCode
            }
        }

        return {
            cip13,
            expiryDate,
        }
    }

    return {
        parseBarcode,
    }
}
