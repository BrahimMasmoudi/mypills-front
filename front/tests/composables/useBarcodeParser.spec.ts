import { describe, it, expect } from 'vitest'
import { useBarcodeParser } from '~/composables/useBarcodeParser'

describe('useBarcodeParser', () => {
    const { parseBarcode } = useBarcodeParser()

    it('parses GS1 DataMatrix code with AI 01 GTIN and AI 17 expiry date', () => {
        const result = parseBarcode('\u001d010340093595583817281231')

        expect(result.cip13).toBe('3400935955838')
        expect(result.expiryDate).toBeInstanceOf(Date)
        expect(result.expiryDate?.getFullYear()).toBe(2028)
        expect(result.expiryDate?.getMonth()).toBe(11)
        expect(result.expiryDate?.getDate()).toBe(31)
    })

    it('parses GS1 DataMatrix code without AI 17 expiry date', () => {
        const result = parseBarcode('0103400935955838')

        expect(result.cip13).toBe('3400935955838')
        expect(result.expiryDate).toBeNull()
    })

    it('strips leading zero from 13-digit non-GS1 code starting with 0', () => {
        const result = parseBarcode('0340093595583')

        expect(result.cip13).toBe('340093595583')
        expect(result.expiryDate).toBeNull()
    })

    it('keeps 13-digit non-GS1 code not starting with 0 intact', () => {
        const result = parseBarcode('3400935955838')

        expect(result.cip13).toBe('3400935955838')
        expect(result.expiryDate).toBeNull()
    })

    it('returns empty cip13 for empty or control-character-only input', () => {
        expect(parseBarcode('')).toEqual({ cip13: '', expiryDate: null })
        expect(parseBarcode('\u001d\r\n\t ')).toEqual({ cip13: '', expiryDate: null })
    })
})
