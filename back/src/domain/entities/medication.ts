export type Medication = {
    medicationId: string
    uid: string
    bareCode: string
    name: string
    expiryDate: Date
    expired: boolean
    quantity: number
    unitsPerBox?: number
    numberOfBoxes: number
    image: string
    email: string
    details?: MedicationDetails
    createdAt: Date
    updatedAt: Date
}

export type MedicationDetails = {
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
    }[],
    quantity: number
}
