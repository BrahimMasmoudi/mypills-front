import { toMedicationDto } from './mapper'
import { MedicamentResponse } from '../types/medicationApi'

describe('Mapper Utils', () => {
    const baseResponse: MedicamentResponse = {
        cis: 12345678,
        elementPharmaceutique: 'Test Element',
        formePharmaceutique: 'Tablet',
        voiesAdministration: ['Orale'],
        statusAutorisation: 'Authorized',
        typeProcedure: 'Procedure',
        etatComercialisation: 'Marketed',
        dateAMM: '2023-01-01',
        titulaire: 'Pharma Corp',
        surveillanceRenforcee: 'Non',
        composition: [],
        generiques: [],
        presentation: [],
        conditions: [],
    }

    describe('toMedicationDto', () => {
        it('should map basic fields correctly', () => {
            const result = toMedicationDto(baseResponse)
            expect(result.form).toBe('Tablet')
            expect(result.company).toBe('Pharma Corp')
            expect(result.enhancedSurveillance).toBe(false)
        })

        it('should map enhanced surveillance correctly when "Oui"', () => {
            const response = { ...baseResponse, surveillanceRenforcee: 'Oui' }
            const result = toMedicationDto(response)
            expect(result.enhancedSurveillance).toBe(true)
        })
    })

    describe('parseMedicationUnit (via toMedicationDto quantity)', () => {
        const createResponseWithLabel = (label?: string): MedicamentResponse => ({
            ...baseResponse,
            presentation: label ? [{
                cis: 1, cip7: 1, libelle: label,
                statusAdministratif: '', etatComercialisation: '', dateDeclaration: '',
                cip13: 1, agreement: '', tauxRemboursement: '', prix: 0,
            }] : [],
        })

        it('should parse standard format "30 comprimés"', () => {
            const response = createResponseWithLabel('Boîte de 30 comprimés')
            expect(toMedicationDto(response).quantity).toBe(30)
        })

        it('should parse edge case "B/24 sachets/10 ml"', () => {
            const response = createResponseWithLabel('B/24 sachets/10 ml')
            expect(toMedicationDto(response).quantity).toBe(24)
        })

        it('should parse singular unit "1 unidose"', () => {
            const response = createResponseWithLabel('1 unidose')
            expect(toMedicationDto(response).quantity).toBe(1)
        })

        it('should parse plural units "10 gélules"', () => {
            const response = createResponseWithLabel('10 gélules')
            expect(toMedicationDto(response).quantity).toBe(10)
        })

        it('should handle no space between number and unit "24sachets"', () => {
            const response = createResponseWithLabel('24sachets')
            expect(toMedicationDto(response).quantity).toBe(24)
        })

        it('should default to 1 if no match found', () => {
            const response = createResponseWithLabel('Boîte de rien')
            expect(toMedicationDto(response).quantity).toBe(1)
        })

        it('should default to 1 if label is undefined', () => {
            const response = createResponseWithLabel(undefined)
            expect(toMedicationDto(response).quantity).toBe(1)
        })

        it('should parse case insensitive "30 CAPSULES"', () => {
            const response = createResponseWithLabel('30 CAPSULES')
            expect(toMedicationDto(response).quantity).toBe(30)
        })
    })
})
