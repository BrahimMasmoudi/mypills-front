export interface MedicationDetailDto {
    form: string
    administrationRoutes: string[]
    authStatus: string
    procedureType: string
    marketingStatus: string
    approvalDate: string
    company: string
    enhancedSurveillance: boolean
    ingredients: {
        substance: string
        dosage: string
        reference: string
    }[]
    presentations: {
        label: string
        barcode13: number
        refundRate: string
        price: number
    }[]
    quantity: number
}
