export interface MedicationDetails {
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

export interface GetMedicationDetailsResponse {
    name: string
    cis: string | number
    details: MedicationDetails
}
